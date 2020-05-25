import supertest = require("supertest");
import {assert} from "chai";

const appPort = process.env.APP_PORT || 8080;
const request = supertest('http://localhost:' + appPort);

let gotID;

describe('POST /orders', () => {
    it('should return successful response for proper input', function () {
        this.timeout(5000);
        return request.post('/orders')
            .send({
                "origin": ["22.3943512", "113.9564782"],
                "destination": ["22.3359551", "114.1095177"],
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                assert.hasAnyKeys(response.body, ['id', 'distance', 'status']);
                assert.equal(response.body.status, 'UNASSIGNED');
                assert.approximately(response.body.distance, 23857, 500);
                gotID = response.body.id;
            });
    });
});

describe('PATCH /orders', () => {
    it('should return successful response for proper input', () => {
        return request.patch('/orders/' + gotID)
            .send({
                "status": "TAKEN"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                assert.hasAnyKeys(response.body, ['status']);
                assert.equal(response.body.status, 'SUCCESS');
            });
    });
});

describe('GET /orders', () => {
    it('should return items that contain the tested id', () => {
        return request.get('/orders?page=1&limit=100')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                const found = response.body.find(item => item.id === gotID);
                assert.isNotNull(found);
                assert.equal(found.status, 'TAKEN');
                assert.approximately(found.distance, 23857, 500);
            });
    });
});
