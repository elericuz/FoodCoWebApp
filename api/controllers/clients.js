const _ = require('lodash');
const Client = require('../models/clients');
const Address = require('../models/address');
const Warehouse = require('../models/warehouses');

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
    let warehouses = await getWarehouses(req.params.id);

    await getClient(req.params.id)
        .then(result => {
            res.status(200).json({
                message: 'success',
                data: {
                    'client': result,
                    'warehouses': warehouses
                }
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

exports.saveWarehouse = async (req, res, next) => {
    let data = req.body;
    let warehouses = [];
    if(!_.isEmpty(data.idClient)) {
        let client = await Client.findById(data.idClient)
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
        warehouses = client.warehouses;
    }

    await saveAddress(data, null, 'Warehouse')
        .then(async (response) => {
            data.addressId = response._id;

            if (!_.isEmpty(data.idClient)) {
                data.client_id = data.idClient;
                delete data.idClient
            }

            await saveWarehouse(data)
                .then(async result => {
                    if(warehouses.length > 0) {
                        warehouses.push(result._id)
                        await Client.findByIdAndUpdate(data.client_id, {warehouses: warehouses})
                            .then(res => {
                                return res;
                            })
                            .catch(error => console.log(error));
                    }

                    res.status(201).json({
                        message: "Warehouse added.",
                        data: result
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Something went wrong",
                        data: err
                    })
                });
        });
}

exports.removeWarehouse = async (req, res, next) => {
    await removeWarehouse(req.params.id)
        .then((response) => {
            res.status(200).json({
                message: "Warehouse deleted.",
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

exports.getWarehouse = async (req, res, next) => {
    await getWarehouse(req.params.id)
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

exports.getWarehouses = async (req, res, next) => {
    await Warehouse.find({ client_id: req.params.id, status: true })
        .select('name')
        .sort({name: 'asc'})
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

exports.updateWarehouse = async (req, res, next) => {
    let data = req.body;

    await saveAddress(data, data.idAddressWarehouse, 'Warehouse')
        .then((result) => {
            return result;
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });

    await saveWarehouse(data, data.idWarehouse)
        .then(async (response) => {
            return response
        })
        .catch(error => {
            res.status(500).json({
                message: "Something went wrong",
                data: error
            })
        });

    await Warehouse.findById(data.idWarehouse)
        .populate({
            path: 'address',
            model: 'Address'
        })
        .then(result => {
            res.status(201).json({
                message: "Warehouse updated.",
                data: result
            })
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: error
            })
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

async function saveAddress(data, id = null, type = 'Client') {
    let addressData = {
        type: type,
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
        if (!_.isEmpty(_.trim(data.idWarehousesList, ','))) {
            clientData.warehouses = _.trim(data.idWarehousesList, ',').split(',');
        }
        let client = new Client(clientData);
        return client.save()
            .then(result => {
                if (!_.isEmpty(_.trim(data.idWarehousesList, ','))) {
                    clientData.warehouses.forEach((warehouse) => {
                        Warehouse.findByIdAndUpdate(warehouse, {client_id: result._id})
                            .then(response => {
                                return response;
                            })
                            .catch(error => console.log(error));
                    })
                }
                return result;
            })
            .catch(err => console.log(err));
    } else {
        return Client.findByIdAndUpdate(id, clientData)
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }
}

async function saveWarehouse(data, id = null) {
    const warehouseData = {
        name: data.name,
        address: _.isNull(id) ? data.addressId : data.idAddressWarehouse,
        phone: data.phone,
        email: data.email,
        contact: data.contact
    };

    if (id == null) {
        warehouseData.client_id = data.client_id;
        let warehouse = new Warehouse(warehouseData);
        return await warehouse.save()
            .then(async result => {
                return await Warehouse.findById(result.id)
                    .populate({
                        path: 'address',
                        model: 'Address'
                    })
                    .then(res => {
                        return res;
                    })
                    .catch(error => console.log(error));
            })
            .catch(err => console.log(err));
    } else {
        return Warehouse.findByIdAndUpdate(id, warehouseData)
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
        .populate([{
            path: 'warehouse',
            model: 'Warehouses'
        }])
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

async function getWarehouses(idClient) {
    return Warehouse.find({'client_id': idClient, 'status': true})
        .populate([{
            path: 'address',
            model: 'Address'
        }])
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function getWarehouse(id) {
    return Warehouse.findById(id)
        .populate({
            path: 'address',
            model: 'Address'
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function removeWarehouse(id) {
    return Warehouse.findByIdAndUpdate(id, { status: false })
        .then(result => { return result; })
        .catch(err => { return err; })
}