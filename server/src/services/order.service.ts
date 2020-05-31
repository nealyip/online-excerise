import {Order} from "../models/orders";
import {v4} from "uuid";
import {now} from "../helper";
import sequelize from "../models/sequelize";
import {Sequelize} from "sequelize";
import {OrderHistory} from "../models/order_history";

export class ClientError extends Error {
}

export class OrderService {
    private order: typeof Order;
    private orderHistory: typeof OrderHistory;
    private sequelize: Sequelize;

    constructor(sequelizeInstance?: Sequelize, order?: typeof Order, orderHistory?: typeof OrderHistory) {
        this.order = order || Order;
        this.orderHistory = orderHistory || OrderHistory;
        this.sequelize = sequelizeInstance || sequelize;
    }

    async create(origin: [string, string], destination: [string, string], distance: number): Promise<Order> {
        const order = await this.order.create({
            uuid: v4().replace(/-/g, ''),
            origin_latitude: origin[0],
            origin_longitude: origin[1],
            destination_latitude: destination[0],
            destination_longitude: destination[1],
            distance: distance,
            status: 'UNASSIGNED',
            created_at: now(),
            updated_at: now(),
        });

        await this.orderHistory.create({
            order_id: order.id,
            status: order.status,
            assignee: order.assignee,
            created_at: now(),
            updated_at: now(),
        });
        return order;
    }

    async assign(id: string, assignee: string): Promise<void> {

        await this.sequelize.transaction(async transaction => {
            const order: Order = await this.order.findOne({
                where: {
                    uuid: Buffer.from(id, 'hex'),
                },
                transaction,
                lock: true
            });

            if (!order) {
                throw new ClientError('Order not found');
            }
            if (order.status !== 'UNASSIGNED') {
                throw new ClientError('Order has been taken.');
            }

            order.status = 'TAKEN';
            order.updated_at = now();
            order.assignee = assignee; // Simulate an assignee here.
            await order.save({
                transaction
            });

            await this.orderHistory.create({
                order_id: order.id,
                status: order.status,
                assignee: order.assignee,
                created_at: now(),
                updated_at: now(),
            }, {
                transaction
            });
        });
    }

    async list(page: number, limit: number): Promise<Array<Pick<Order, 'uuid' | 'distance' | 'status'>>> {
        return this.order.findAll({
            limit,
            offset: (page - 1) * limit,
            attributes: ['uuid', 'distance', 'status'],
            order: [['created_at', 'DESC']]
        });
    }
}
