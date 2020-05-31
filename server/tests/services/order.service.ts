import * as mocha from 'mocha';
import {assert, expect} from 'chai';
import {ClientError, OrderService} from '../../src/services';

describe('OrderService', () => {
    describe('create', () => {
        it('should create an order with uuid auto generated.', async () => {
            let calledCreate = false;
            const mockOrder = class Order {
                static async create(params) {
                    calledCreate = true;
                    assert.equal(params.origin_latitude, "22.3943512");
                    assert.equal(params.origin_longitude, "113.9564782");
                    assert.equal(params.destination_latitude, "22.3359551");
                    assert.equal(params.destination_longitude, "114.1095177");
                    assert.equal(params.distance, 3);
                    assert.equal(params.status, 'UNASSIGNED');
                    assert.match(params.uuid, /^[0-9a-f]{32}$/i);
                    assert.approximately(params.created_at.getTime(), new Date().getTime(), 1000);
                    assert.approximately(params.updated_at.getTime(), new Date().getTime(), 1000);
                }
            }

            const orderService = new OrderService(mockOrder as any);
            await orderService.create(["22.3943512", "113.9564782"], ["22.3359551", "114.1095177"], 3);
            assert.equal(calledCreate, true);
        });
    });

    describe('assign', () => {
        const mockSequelize = class {
            async transaction(callback) {
                await callback(null);
            }
        }

        it('should throw an error if the order id is not found', async () => {
            let calledFindOne = false;
            const mockOrder = class Order {
                static async findOne(params) {
                    calledFindOne = true;
                    return null;
                }
            }

            const orderService = new OrderService(mockOrder as any, new mockSequelize() as any);

            // @ts-ignore
            await expect(orderService.assign('17c541d421474f7d9537852a51ca97a1', '2')).to.be.rejectedWith(ClientError, 'Order not found');
            assert.equal(calledFindOne, true);
        });
        it('should throw an error if the order id is not taken', async () => {
            let calledFindOne = false;
            const mockOrder = class Order {
                static async findOne(params) {
                    calledFindOne = true;
                    return {
                        status: 'TAKEN'
                    };
                }
            }
            const orderService = new OrderService(mockOrder as any, new mockSequelize() as any);

            // @ts-ignore
            await expect(orderService.assign('17c541d421474f7d9537852a51ca97a1', '2')).to.be.rejectedWith(ClientError, 'Order has been taken.');
            assert.equal(calledFindOne, true);
        });
        it('should call save with status TAKEN, otherwise', async () => {
            let calledSave = false;
            const mockOrder = class Order {
                private status: any;
                private assignee: any;
                private updated_at: any;
                constructor(params) {
                    this.status = params.status;
                    this.assignee = params.assignee;
                    this.updated_at = params.updated_at;
                }

                static async findOne(params) {
                    return new Order({
                        status: 'UNASSIGNED'
                    });
                }
                async save(params){
                    assert.equal(this.status, 'TAKEN');
                    assert.equal(this.assignee, '2');
                    assert.approximately(this.updated_at.getTime(), new Date().getTime(), 1000);
                    calledSave = true;
                }
            }
            const orderService = new OrderService(mockOrder as any, new mockSequelize() as any);

            await orderService.assign('17c541d421474f7d9537852a51ca97a1', '2');
            assert.equal(calledSave, true, 'Must have called save');
        });
    });

    describe('list', () => {
        it('should return an array of orders.', async () => {
            let calledfindAll = false;
            const mockOrder = class Order {
                static async findAll(params) {
                    assert.equal(params.limit, 10);
                    assert.equal(params.offset, 20);
                    assert.deepEqual(params.attributes, ['uuid', 'distance', 'status']);
                    assert.deepEqual(params.order, [['created_at', 'DESC']]);
                    calledfindAll = true;
                }
            }

            const orderService = new OrderService(mockOrder as any);
            await orderService.list(3, 10);
            assert.equal(calledfindAll, true, 'Must have called save');
        });
    });
});
