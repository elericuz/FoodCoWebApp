const _ = require('lodash');
const Product = require('../models/products');
const Unit = require('../models/units');
const ProductPrices = require('../models/product_prices');
const Detail = require('../models/details');
const jwt = require('jsonwebtoken');

exports.listAll = async (req, res, next) => {
    let page = req.params.page;
    if (_.isUndefined(page) || !Number.isInteger(page*1)) {
        page = 1;
    }

    const limit = 16;
    const skip = (page === 1) ? 0 : (limit * (page-1))
    const products = await getProducts(skip, limit);
    const totalPages = Math.ceil(products.count/limit)
    if (page > totalPages) {
        res.redirect('/products');
    }

    const units = await getUnits();

    res.render('products/list', {
        total: products.count,
        showing: {
            from: ((page - 1) * limit) + 1,
            to: ((page * limit) > products.count) ? products.count : page * limit
        },
        totalPages: totalPages,
        currentPage: page,
        products: products.data,
        units: units,
        uri: 'products'
    });
};

exports.save = async (req, res, next) => {
    let data = req.body;

    let units = data.units;
    let prices = data.price;

    data.created_by = await getCurrentUser(req.cookies.userToken);

    await saveProduct(data)
        .then(async (result) => {
            await savePrices(units, prices, result._id)
                .then(response => {
                    res.status(200).json({
                        message: "Product added.",
                        data: result,
                        prices: response
                    })
                })
                .catch(error => {
                    res.status(500).json({
                        message: "Something went wrong",
                        data: error
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
}

exports.remove = async (req, res, next) => {
    await removeProduct(req.params.id)
        .then((response) => {
            res.status(200).json({
                message: "Product deleted.",
                data: response
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            });
        })
}

exports.get = async (req, res, next) => {

    let prices = await ProductPrices.find({product_id: req.params.id, status: true})
        .select('unit_id price -_id')
        .then(result => { return result })
        .catch(err => console.log(err));

    Product.findById(req.params.id)
        .populate({
            path: 'created_by',
            model: 'User'
        })
        .populate({
            path: 'updated_by',
            model: 'User'
        })
        .then(result => {
            res.status(200).json({
                message: 'success',
                data: result,
                prices: prices
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            });
        })
}

exports.update = async (req, res, next) => {
    let data = req.body;
    data.updated_by = await getCurrentUser(req.cookies.userToken);
    data.inactive = data.inactive === "true"
    data.exclusive_item = (_.isUndefined(data.exclusive_item)) ? false : true;
    data.catch_wt_sgl = (_.isUndefined(data.catch_wt_sgl)) ? false : true;
    data.catch_wt_mutli = (_.isUndefined(data.catch_wt_mutli)) ? false : true;
    data.par_item = (_.isUndefined(data.par_item)) ? false : true;
    data.adv_purchase = (_.isUndefined(data.adv_purchase)) ? false : true;
    data.adv_purchase_days = (_.isUndefined(data.adv_purchase_days)) ? false : data.adv_purchase_days;
    data.expense = (_.isUndefined(data.expense)) ? false : true;
    data.misc_item = (_.isUndefined(data.misc_item)) ? false : true;
    data.non_stock = (_.isUndefined(data.non_stock)) ? false : true;
    data.prepack_item = (_.isUndefined(data.prepack_item)) ? false : true;
    data.supply = (_.isUndefined(data.supply)) ? false : true;
    data.web_exclude = (_.isUndefined(data.web_exclude)) ? false : true;
    data.two_specian_inv = (_.isUndefined(data.two_specian_inv)) ? false : true;
    data.non_produce = (_.isUndefined(data.non_produce)) ? false : true;
    data.non_domestic = (_.isUndefined(data.non_domestic)) ? false : true;
    data.organic = (_.isUndefined(data.organic)) ? false : true;
    data.pesticide_free = (_.isUndefined(data.pesticide_free)) ? false : true;
    data.pallet_tags = (_.isUndefined(data.pallet_tags)) ? false : true;
    data.taxable = (_.isUndefined(data.taxable)) ? false : true;
    data.quality_check = (_.isUndefined(data.quality_check)) ? false : true;
    data.future_buying_guide = (_.isUndefined(data.future_buying_guide)) ? false : true;
    data.daily_buying_guide = (_.isUndefined(data.daily_buying_guide)) ? false : true;
    data.non_commission = (_.isUndefined(data.non_commission)) ? false : true;
    data.totes = (_.isUndefined(data.totes)) ? false : true;
    data.driver_load = (_.isUndefined(data.driver_load)) ? false : true;

    let units = data.units;
    let prices = data.price;

    data.price = null;
    data.units = null;

    let productId = data.idProduct

    await updateProduct(data.idProduct, data)
        .then(async (response) => {
            return await savePrices(units, prices, productId)
                .then(result => {
                    res.status(200).json({
                        message: "Product updated.",
                        data: response
                    })
                })
                .catch(error => {
                    res.status(500).json({
                        message: "Something went wrong",
                        data: error
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                message: 'Something went wrong',
                data: err
            });
        })
}

exports.getUnits = async (req, res, next) => {
    const productId = req.params.id
    let prices = await ProductPrices.find({
        product_id: productId,
        status: true
    })
        .select('-_id -product_id -createdAt -updatedAt')
        .populate({
            path: 'unit_id',
            model: 'Units',
            select: 'name'
        })
        .select('-status')
        .then(result => { return result; })
        .catch(err => console.log(err));

    res.status(200).json({
        message: "ok",
        units: prices
    })
}

exports.getProductPrice = async (req, res, next) => {
    const productId = req.params.productId;
    const unitId = req.params.unitId;

    const price = await ProductPrices.findOne({
        product_id: productId,
        unit_id: unitId,
        status: true
    })
        .select('-_id price')
        .then(result => {
            return result.price;
        })
        .catch(err => console.log(err));

    res.status(201).json({
        message: "ok",
        price: price
    })
}

exports.searchProduct = async (req, res, next) => {
    let text = req.params.text;

    await Product.find({
        $and: [
            { status: true },
            { $or: [
                    { 'manufacturer_id': { $regex: text, $options: 'i' } },
                    { 'spanish_name': { $regex: text, $options: 'i' } },
                    { 'manufacturer_name': { $regex: text, $options: 'i' } },
                    { 'manufacturer_brand_name': { $regex: text, $options: 'i' } },
                    { 'manufacturer_part_number': { $regex: text, $options: 'i' } }
                ]
            }
        ]
    })
        .select('manufacturer_name')
        .sort({'manufacturer_name': 'asc'})
        .limit(20)
        .then(result => {
            let response = {
                status: 'no-results',
                message: 'Product not found'
            };

            if (result.length > 0) {
                response = {
                    status: 'success',
                    data: result
                }

            }

            res.status(201).json(response)
        })
        .catch(err => {
            res.status(400).json({
                status: 'failed',
                message: 'Something went wrong'
            })
        })
}

exports.getMostPopularProducts = async (req, res, next) => {
    const products = await getMostPopularProducts();

    let mostPopularProducts = []
    products.forEach((product) => {
        mostPopularProducts.push({
            name: product._id[0],
            weight: product.count
        })
    })

    res.status(201).json({
        products: mostPopularProducts
    })
}

async function saveProduct(data) {
    let lastCodeNumber = await getLastCodeNumber();
    let nextCodeNumber = lastCodeNumber.code + 1;
    data.code = nextCodeNumber;

    data.price = null;
    let product = new Product(data);
    return product.save()
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function deletePrices(productId) {
    return ProductPrices.find({product_id: productId, status: true})
        .select('_id')
        .then(result => {
            result.forEach((value) => {
                ProductPrices.findByIdAndUpdate(value._id, {status: false})
                    .then(response => {
                        return response;
                    })
                    .catch(error => console.log(error));
            })
        })
        .catch(err => console.log(err));
}

async function savePrices(units, data, productId) {
    await deletePrices(productId);

    let prices = [];
    data.forEach((value, index) => {
        prices.push({
            product_id: productId,
            unit_id: units[index],
            price: value
        });
    })

    return prices.forEach(price => {
        let productPrices = new ProductPrices(price)
        return productPrices.save()
            .then(result => {
                return result;
            })
            .catch(err => console.log(err))
    });
}

async function getProducts(skip = 1, limit = 30) {
    return await Product.aggregate([
        {
            $match: { status: true }
        },
        {
            $sort: { manufacturer_name: 1, code: 1 }
        },
        {
            $facet: {
                "total" : [ { "$group": {_id: null, count: { $sum:1 } } } ],
                "data" : [ { "$skip": skip }, { "$limit": limit } ]
            }
        },
        {
            $unwind: "$total"
        },
        {
            $project:{
                count: "$total.count",
                data: "$data"
            }
        }
    ])
        .then(result => {
            return result[0];
        })
        .catch(err => console.log(err));
}

async function removeProduct(id) {
    await deletePrices(id);

    return Product.findByIdAndUpdate(id, { status: false })
        .then(result => { return result; })
        .catch(err => { return err; })
}

async function updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data)
        .then(result => {
            return result;
        })
        .catch(err => { return err; })
}

async function getLastCodeNumber() {
    let product = Product.findOne()
        .select('code -_id')
        .sort({code: 'desc'})
        .then((result) => {
            if (_.isNull(result)) {
                return { code: 0 }
            } else {
                return result;
            }
        })
        .catch(err => console.log(err));
    return product
}

async function getUnits() {
    return Unit.find()
        .sort({name: 'asc'})
        .then(result => { return result; })
        .catch(err => console.log(err));
}

async function getMostPopularProducts() {
    return await Detail.aggregate([
        { $match: { "status": true }},
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' }},
        { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' }},
        { $addFields: {
                "order": {
                    "$arrayElemAt": [
                        {
                            "$filter": {
                                "input": "$order",
                                "as": "ord",
                                "cond": {
                                    "$eq": [ "$$ord.status", "open" ]
                                }
                            }
                        }, 0
                    ]
                }
            }  },
        { $group: { _id: "$product.manufacturer_name", count: { $sum: "$quantity" }}},
        { $sort: { count: -1 }},
        { $project: { product: '$product', count: '$count' }},
        { $limit: 32 }
    ])
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

function getCurrentUser(token) {
    let tokenDecoded = jwt.decode(token);

    return tokenDecoded.userId;
}