const router = require('express').Router();
const bodyParser = require('body-parser').json();

const Store = require('../models/store-schema');

router
    .get('/', (req, res, next) => {
        Store.find()
            .then(stores => {
                return Store.sortPrice();
            })
            .then(stores => res.send(stores))
            .catch(next);
    })
    .get('/:id', (req, res, next) => {
        Store.findById(req.params.id)
            .then(store => {
                if (!store) {
                    res.status(404).send({ error: `Id ${req.params.id} Not Found` });
                } else {
                    res.send(store);
                }
            })
            .catch(next);
    })
    .post('/', bodyParser, (req, res, next) => {
        new Store(req.body).save()
            .then(store => res.send(store))
            .catch(next);
    })
    .put('/:id', bodyParser, (req, res, next) => {
        return Store.findByIdAndUpdate(req.params.id, { name: req.body.store_name }, { new: true, runValidators: true })
            .then(store => {
                res.send(store);
            })
            .catch(next);
    })
    .delete('/:id', bodyParser, (req, res, next) => {
        Store.findByIdAndRemove(req.params.id)
            .then(deleted => res.send({ deleted: !!deleted }))
            .catch(next);
    });

module.exports = router;