const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;
const User = require('../../lib/models/user-schema');
const Token = require('../../lib/auth/token');

const app = require('../../lib/app');

const request = chai.request(app);

describe('ITEMS API ROUTE TESTS', () => {

    let token = '';
    let role = '';

    before(() => {
        return User.findOne({ name: 'test' })
            .then(user => {
                return Token.sign(user.id);
            })
            .then(data => {
                return token = data;
            });
    });

    it('GET /items returns an empty array', () => {
        return request.get('/items')
            .set('Authorization', token)
            .then(req => req.body)
            .then(items => assert.deepEqual(items, []));
    });

    let cheese = { item: 'cheese', attributes: ['American'], store: 'Fred Meyer' };
    let stinkyCheese = { item: 'stinky cheese', attributes: ['Italian'], store: 'Fred Meyer' };
    let worldsWorst = { item: 'world\'s stinkiest cheese', attributes: ['French'], store: 'Fred Meyer' };

    let fredMeyer = {
        'name': 'Fred Meyer',
        'description': 'Burlingame Fred Meyer',
        'brand': 'Alpenrose',
        'price': '$2.00',
        'size': '1000',
        'unit': 'ml'
    };

    function saveItem(item, role) {
        return request.post('/items')
            .query({ role })
            .set('Authorization', token)
            .send(item)
            .then(res => res.body);
    }

    function saveStore(store) {
        return request.post('/stores')
            .query({ role })
            .set('Authorization', token)
            .send(store)
            .then(res => res.body);
    }

    before('loads store for testing', () => {
        saveStore(fredMeyer);
    });

    // TODO: request accounts here and get role for that account and replace following code
    // take this out when we have accounts object
    it('POST /items adds item via Item schema', () => {
        // take this out when we have accounts object
        role = 'owner';
        return saveItem(cheese, role)
            .then(savedItem => {
                assert.isOk(savedItem._id);
                cheese._id = savedItem._id;
                assert.equal(savedItem.item, cheese.item);
            });
    });

    it('GET /items returns list of items', () => {
        return Promise.all([saveItem(stinkyCheese, role), saveItem(worldsWorst, role)])
            .then(() => request.get('/items')
                .set('Authorization', token))
            .then(res => {
                const items = res.body;
                assert.equal(items.length, 3);
                assert.equal(items[2].item, worldsWorst.item);
            });
    });

    it('GET /items/:id returns item by ID', () => {
        return request.get(`/items/${cheese._id}`)
            .set('Authorization', token)
            .then(req => req.body)
            .then(item => assert.equal(item.item, cheese.item));
    });


    // TODO: request accounts here and get role for that account and replace following code
    // take this out when we have accounts object
    it('DELETE /items/:id deletes item by ID', () => {
        role = 'owner';

        return request
            .delete(`/items/${cheese._id}`)
            .query({ role })
            .set('Authorization', token)
            .then(res => assert.isTrue(res.body.deleted));
    });


    // TODO: request accounts here and get role for that account and replace following code
    // take this out when we have accounts object
    it('DELETE /items/:id returns false if item does not exist', () => {
        return request.delete(`/items/${cheese._id}`)
            .query({ role })
            .set('Authorization', token)
            .then(res => assert.isFalse(res.body.deleted));
    });

    it('GET /items/:id returns 404 when item does not exist', () => {
        return request.get(`/items/${cheese._id}`)
            .set('Authorization', token)
            .then(
                () => { throw new Error('success status code not expected'); },
                res => {
                    assert.equal(res.status, 404);
                    assert.isOk(res.response.body.error);
                }
            );
    });

    it('GET /items confirms item removed from list', () => {
        return request.get('/items')
            .set('Authorization', token)
            .then(req => req.body)
            .then(items => assert.equal(items.length, 2));
    });

});