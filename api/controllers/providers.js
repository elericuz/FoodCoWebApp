const _ = require('lodash');
const moment = require('moment');
const Providers = require('../models/providers');
const Addresses = require('../models/address');

exports.listAll = async (req, res, next) => {
    const providers = await getProviders();

    res.render('providers/list', { providers: providers });
};

exports.save = ( async (req, res, next) => {
    const addressData = {
        type: "Provider",
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode
    };
    let address = await saveAddress(addressData);

    const providerData = {
        name: req.body.name,
        address_id: address._id,
        contact: req.body.contact,
        phone: req.body.phone
    };
    let provider = await saveProvider(providerData);

    Addresses.findByIdAndUpdate(address._id, { provider_id: provider._id })
        .then((result) => {
            res.status(200).json({
                message: "Provider added.",
                data: provider
            })
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
});

exports.remove = async (req, res, next) => {
    await removeProvider(req.params.id)
        .then((response) => {
            res.status(200).json({
                message: "Provider deleted.",
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
    Providers.findById(req.params.id)
        .populate({
            path: 'address_id',
            model: 'Address'
        })
        .then(result => {
            res.status(200).json({
                message: 'success',
                provider: result
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
    const addressData = {
        type: "Provider",
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode
    };

    const providerData = {
        name: req.body.name,
        contact: req.body.contact,
        phone: req.body.phone
    };

    await updateAddress(req.body.idAddress, addressData)
        .then(async (result) => {
            await updateProvider(req.body.idProvider, providerData)
                .then(async (response) => {
                    await getProvider(req.body.idProvider)
                        .then(data => {
                            res.status(200).json({
                                message: 'Provider updated.',
                                data: data
                            })
                        })
                        .catch(err1 => {
                            res.status(500).json({
                                message: 'Something went wrong 1',
                            })
                        })
                })
                .catch(err => {
                    res.status(500).json({
                        message: 'Something went wrong 1',
                    })
                })
        })
        .catch(error => {
            res.status(500).json({
                message: 'Something went wrong 2',
                error: error
            })
        });
}

async function updateAddress(id, data) {
    return Addresses.findByIdAndUpdate(id, data)
        .then(result => { return result; })
        .catch(err => {
            console.log(err);
            return err;
        })
}

async function updateProvider(id, data) {
    return Providers.findByIdAndUpdate(id, data)
        .then(result => { return result; })
        .catch(err => { return err; })
}

async function removeProvider(id) {
    return Providers.findByIdAndDelete(id)
        .then(result => { return result; })
        .catch(err => { return err; })
}

async function getProviders() {
    return Providers.find()
        .sort({name: 'asc'})
        .populate({
            path: 'address_id',
            model: 'Address'
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function getProvider(id) {
    return Providers.findById(id)
        .populate({
            path: 'address_id',
            model: 'Address'
        })
        .then(result => { return result; })
        .catch(err => { return err; })
}

async function saveAddress(data) {
    let address = new Addresses(data);
    return address.save()
        .then(result => { return result })
        .catch(err => console.log(err));
}

async function saveProvider(data) {
    let provider = new Providers(data);
    return provider.save()
        .then(result => { return result })
        .catch(err => console.log(err));
}