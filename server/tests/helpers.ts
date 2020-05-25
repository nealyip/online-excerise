import * as mocha from 'mocha';
import {assert, expect, use} from 'chai';
import rewire = require('rewire');
import {now, sendUnprocessableEntryResponse} from '../src/helper';
import {Result, ValidationError} from "express-validator";

use(require('chai-as-promised'));

const privateHelper = rewire('../src/helper');
privateHelper.__get__('log').disableAll();

describe('helper', () => {
    describe('sendUnprocessableEntryResponse', () => {
        it('should invoke send function with 422 status code', done => {
            sendUnprocessableEntryResponse({
                status(code: number) {
                    assert.equal(code, 422);
                    return this;
                },
                send(body) {
                    assert.hasAnyKeys(body, ['error']);
                    done();
                    return this;
                }
            } as any, new Result<ValidationError>((err) => err, [{
                param: 'field_a',
                location: null,
                msg: 'invalid value',
                value: null
            }]))
        });
    });

    describe('now', () => {
        it('should return a Date object of now', (done) => {
            const nowDate = now();
            assert.approximately(new Date().getTime(), nowDate.getTime(), 2000);
            done();
        });
    });

    describe('getDistance', () => {
        const getDistance: (origin: [string, string], destination: [string, string]) => Promise<number> =
            privateHelper.__get__('getDistance');

        it('should throw an error if the api returns an error message', async () => {
            privateHelper.__set__('get', async (url) => {
                return JSON.stringify({
                    'error_message': "The api key is expired."
                });
            });

            // @ts-ignore
            await expect(getDistance(["0", "0"], ["1", "1"])).to.be.rejectedWith(Error, 'The api key is expired.');
        });

        it('should throw an error if the api returns not a known format', async () => {
            privateHelper.__set__('get', async (url) => {
                return JSON.stringify({
                    'routes': [
                        {
                            'legs': [{}]
                        }
                    ]
                });
            });

            // @ts-ignore
            await expect(getDistance(["0", "0"], ["1", "1"])).to.be.rejectedWith(Error, 'Unknown response format from GCP.');
        });

        it('should throw an error if the distance value from GCP is a string', async () => {
            privateHelper.__set__('get', async (url) => {
                return JSON.stringify({
                    'routes': [
                        {
                            'legs': [{
                                'distance': {
                                    'value': "999"
                                }
                            }]
                        }
                    ]
                });
            });

            // @ts-ignore
            await expect(getDistance(["0", "0"], ["1", "1"])).to.be.rejectedWith(Error, 'Unknown response format from GCP.');
        });
        it('should return the distance in an integer format', async () => {
            privateHelper.__set__('get', async (url) => {
                return JSON.stringify({
                    'routes': [
                        {
                            'legs': [{
                                'distance': {
                                    'value': 999
                                }
                            }]
                        }
                    ]
                });
            });

            expect(await getDistance(["0", "0"], ["1", "1"])).to.equals(999);
        });
    });
});
