import * as mocha from 'mocha';
import {assert} from 'chai';
import rewire = require('rewire');
import * as orders from '../../src/controllers/orders';
import request = require("supertest");

const privateOrders = rewire('../../src/controllers/orders');
privateOrders.__get__('log').disableAll();

describe('controllers', () => {
    describe('orders', () => {
        describe('validateCoord', () => {
            const validateCoord = privateOrders.__get__('validateCoord');

            it('should return false for latitude in a number format', function (done) {
                assert.equal(validateCoord(0, '0'), false);
                done();
            });
            it('should return false for latitude smaller than -90', function (done) {
                assert.equal(validateCoord('-90', '0'), false);
                done();
            });
            it('should return false for latitude larger than +90', function (done) {
                assert.equal(validateCoord('90', '0'), false);
                done();
            });
            it('should return true for latitude between -90 to +90, exclusive', function (done) {
                assert.equal(validateCoord('89.9', '0'), true);
                done();
            });
            it('should return false for longitude in a number format', function (done) {
                assert.equal(validateCoord('0', 0), false);
                done();
            });
            it('should return false for longitude smaller than +180', function (done) {
                assert.equal(validateCoord('0', '180'), false);
                done();
            });
            it('should return false for longitude smaller than -180', function (done) {
                assert.equal(validateCoord('0', '-180'), false);
                done();
            });
            it('should return true for longitude between -180 to +180, exclusive', function (done) {
                assert.equal(validateCoord('0', '-179.9'), true);
                done();
            });
        });
    });
});


process.env.APP_PORT = '10233';

const server = rewire('../../src/server');
server.__get__('log').disableAll();
const app = server.__get__('app');


describe('Orders', () => {
    describe('GET /', () => {
        it('should return 404', () => {
            return request(app)
                .get('/')
                .expect('Content-Type', /json/)
                .expect(404)
                .then(response => {
                    assert(response.body.error, 'not_found');
                });
        });
    });
    describe('POST /orders', () => {
        it('should return 422 for missing origin', () => {
            return request(app)
                .post('/orders')
                .send({
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin not an array', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": "0,0",
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin having three elements.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0", "0"],
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin having one elements.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0"],
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin having one non-string element.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": [0, "0"],
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin having two non-string elements.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": [0, 0],
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin having latitude equal to 90.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["90", "0"],
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for origin having longitude equal to 180.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "180"],
                    "destination": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for missing destination', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination not an array', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": "0,0",
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination having three elements.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": ["0", "0", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination having one elements.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": ["0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination having one non-string element.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": [0, "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination having two non-string elements.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": [0, 0],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination having latitude equal to 90.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": ["90", "0"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for destination having longitude equal to 180.', () => {
            return request(app)
                .post('/orders')
                .send({
                    "origin": ["0", "0"],
                    "destination": ["0", "180"],
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });


    });

    describe('orderPatch', () => {
        it('should return 422 for missing order id', () => {
            return request(app)
                .patch('/orders')
                .send({
                    "status": "TAKEN"
                })
                .expect('Content-Type', /json/)
                .expect(404)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for missing status', () => {
            return request(app)
                .patch('/orders/1')
                .send({})
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for action other than TAKEN', () => {
            return request(app)
                .patch('/orders/1')
                .send({
                    "status": "TAKING"
                })
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
    });

    describe('ordersGet', () => {
        it('should return 422 for missing page', () => {
            return request(app)
                .get('/orders?limit=1')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for nan page', () => {
            return request(app)
                .get('/orders?page=a&limit=1')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for page number to be zero', () => {
            return request(app)
                .get('/orders?page=0&limit=1')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for page number to be negative', () => {
            return request(app)
                .get('/orders?page=-1&limit=1')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for missing limit', () => {
            return request(app)
                .get('/orders?page=1')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for nan limit', () => {
            return request(app)
                .get('/orders?page=1&limit=a')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for limit to be zero', () => {
            return request(app)
                .get('/orders?page=1&limit=0')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
        it('should return 422 for limit to be negative', () => {
            return request(app)
                .get('/orders?page=1&limit=-1')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert.hasAnyKeys(response.body, ['error']);
                });
        });
    });
});


const instance = server.__get__('server');
instance.close();
