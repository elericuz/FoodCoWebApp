const Warehouse = require('../models/warehouses');

exports.get = async (req, res, next) => {
    await Warehouse.findById(req.params.id)
        .populate({
            path: 'address',
            model: 'Address'
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                status: 'success',
                data: result
            })
        })
        .catch(err => {
            res.status(400).json({
                status: 'failed',
                err: err
            })
        });
};