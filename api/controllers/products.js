const _ = require('lodash');
const Product = require('../models/products');
const jwt = require('jsonwebtoken');

exports.listAll = async (req, res, next) => {
    const products = await getProducts();

    res.render('products/list', { products: products });
};

exports.save = async (req, res, next) => {
    let data = req.body;
    data.created_by = await getCurrentUser(req.cookies.userToken);

    await saveProduct(data)
        .then((result) => {
            res.status(200).json({
                message: "Product added.",
                data: result
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

exports.get = (req, res, next) => {
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
                data: result
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

    data.inactive = (_.isUndefined(data.inactive)) ? false : true
    data.exclusive_item = (_.isUndefined(data.exclusive_item)) ? false : true;
    data.catch_wt_sgl = (_.isUndefined(data.catch_wt_sgl)) ? false : true;
    data.catch_wt_mutli = (_.isUndefined(data.catch_wt_mutli)) ? false : true;
    data.par_item = (_.isUndefined(data.par_item)) ? false : true;
    data.adv_purchase = (_.isUndefined(data.adv_purchase)) ? false : true;
    data.adv_purchase_days = (_.isUndefined(data.adv_purchase_days)) ? false : true;
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

    await updateProduct(data.idProduct, data)
        .then(async (response) => {
            res.status(200).json({
                message: 'Product updated.',
                data: response
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Something went wrong',
                data: err
            });
        })
}

async function saveProduct(data) {
    let lastCodeNumber = await getLastCodeNumber();
    let nextCodeNumber = lastCodeNumber.code + 1;
    data.code = nextCodeNumber;

    let product = new Product(data);
    return product.save()
        .then(result => { return result })
        .catch(err => console.log(err));
}

async function getProducts() {
    return Product.find({ status: true })
        .sort({manufacturer_name: 'asc'})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function removeProduct(id) {
    return Product.findByIdAndUpdate(id, { status: false })
        .then(result => { return result; })
        .catch(err => { return err; })
}

async function updateProduct(id, data) {
    return Product.findByIdAndUpdate(id, data)
        .then(result => { return result; })
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

function getCurrentUser(token) {
    let tokenDecoded = jwt.decode(token);

    return tokenDecoded.userId;
}