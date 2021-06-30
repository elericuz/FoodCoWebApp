const _ = require('lodash');
const Client = require('../models/clients');
const Address = require('../models/address');

exports.listAll = async (req, res, next) => {
    const clients = await getClients();

    res.render('clients/list', { clients: clients });
};

exports.save = async (req, res, next) => {
    let data = req.body;

    await saveAddress(data)
        .then(async (response) => {
            data.address_id = response._id;

            await saveClient(data)
                .then((result) => {
                    res.status(200).json({
                        message: "Client added.",
                        data: result
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Something went wrong",
                        data: err
                    })
                });
        })
}

exports.get = async (req, res, next) => {
    await getClient(req.params.id)
        .then(result => {
            res.status(200).json({
                message: 'success',
                data: result
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Something went wrong',
                data: err
            });
        })
}

exports.update = async (req, res, next) => {
    let data = req.body;

    await saveAddress(data, data.idAddress)
        .then((result) => {
            return result;
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });

    const client = await saveClient(data, data.idClient)
        .then(async (response) => {
            return response
        })
        .catch(error => {
            res.status(500).json({
                message: "Something went wrong",
                data: error
            })
        });

    res.status(200).json({
        message: "Client updated.",
        data: client
    })
}

exports.remove = async (req, res, next) => {
    await removeClient(req.params.id)
        .then((response) => {
            res.status(200).json({
                message: "Client deleted.",
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

async function getClients() {
    return Client.find({status: true})
        .populate({
            path: 'address',
            model: 'Address'
        })
        .sort({commercial_name: 'asc'})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function saveAddress(data, id = null) {
    let addressData = {
        type: 'Client',
        street: data.street,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode
    }

    if (id == null) {
        let address = new Address(addressData);
        return address.save()
            .then(result => {
                return result
            })
            .catch(err => console.log(err));
    } else {
        return Address.findByIdAndUpdate(id, addressData)
            .then(result => { return result })
            .catch(err => console.log(err));
    }
}

async function saveClient(data, id = null) {
    let clientData = {
        code: data.code,
        name: data.name,
        commercial_name: data.commercial_name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        address: _.isNull(id) ? data.address_id : data.idAddress
    }

    if (id == null) {
        let client = new Client(clientData);
        return client.save()
            .then(result => { return result })
            .catch(err => console.log(err));
    } else {
        return Client.findByIdAndUpdate(id, clientData)
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }


}

async function getClient(id) {
    return Client.findById(id)
        .populate({
            path: 'address',
            model: 'Address'
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function removeClient(id) {
    return Client.findByIdAndUpdate(id, { status: false })
        .then(result => { return result; })
        .catch(err => { return err; })
}