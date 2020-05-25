import {Request, Response} from "express";
import {body, param, query, validationResult} from "express-validator";
import {getDistance, now, sendUnprocessableEntryResponse} from "../helper";
import {Order} from "../models/orders";
import {v4} from 'uuid';
import * as log from 'loglevel';
import sequelize from "../models/sequelize";

type OrderPostRequestBody = { origin: [string, string], destination: [string, string] };
type OrderPatchRequestBody = { status: 'TAKEN' | string };
type OrderPatchRequestParam = { id: string };
type OrdersGetRequestQuery = { page?: string, limit?: string };

log.setLevel(log.levels[process.env.LOGLEVEL || 'INFO']);

function validateCoord(latitude: string, longitude: string): boolean {
    if (isNaN(latitude as any) || latitude.constructor !== String || !isFinite(latitude as any) ||
        Math.abs(latitude as any) >= 90) {
        return false;
    }
    return !(isNaN(longitude as any) || longitude.constructor !== String || !isFinite(longitude as any) ||
        Math.abs(longitude as any) >= 180);
}

export const OrderPostValidation = [
    body(['origin', 'destination']).exists().withMessage('must be provided').isArray({
        max: 2,
        min: 2
    }).withMessage('must be an array with 2 numeric string elements').custom((data: [string, string]) => {
        if (!validateCoord(...data)) {
            throw new Error('malformed coordinate');
        }
        return true;
    })
];

export async function orderPost(req: Request<any, any, OrderPostRequestBody>, res: Response) {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return sendUnprocessableEntryResponse(res, err);
    }

    try {

        const distance = await getDistance(req.body.origin, req.body.destination);

        const order: Order = await Order.create({
            id: v4().replace(/-/g, ''),
            origin_latitude: req.body.origin[0],
            origin_longitude: req.body.origin[1],
            destination_latitude: req.body.destination[0],
            destination_longitude: req.body.destination[1],
            distance: distance,
            status: 'UNASSIGNED',
            created_at: now(),
            updated_at: now(),
        });

        log.info('Created successfully', order.toJSON());
        res.send({
            "id": order.id,
            "distance": order.distance,
            "status": order.status
        });
    } catch (err) {
        log.error('Failed to create', err);
        res.status(500);
        res.send({
            "error": 'Internal server error'
        })
    }
}

export const OrderPatchValidation = [
    body('status').exists().withMessage('must be provided').isIn(['TAKEN']).withMessage(
        'must be TAKEN'),
    param('id').exists().withMessage('must be provided')
];

export async function orderPatch(req: Request<OrderPatchRequestParam, any, OrderPatchRequestBody>, res: Response) {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return sendUnprocessableEntryResponse(res, err);
    }

    class ClientError extends Error {
    }

    try {

        await sequelize.transaction(async transaction => {
            const order: Order = await Order.findByPk(req.params.id, {
                transaction,
                lock: true
            });

            if (!order) {
                throw new ClientError('Order not found');
            }
            if (order.status !== 'UNASSIGNED'){
                throw new ClientError('Order has been taken.');
            }

            order.status = 'TAKEN';
            order.assignee = `${Math.floor(Math.random() * 10) + 1}`; // Simulate an assignee here.
            await order.save({
                transaction
            });

            res.send({
                "status": "SUCCESS"
            });
        });

    } catch (e) {
        res.status(e instanceof ClientError ? 422 : 500);
        res.send({error: e.message});
    }

}

export const OrdersGetValidation = [
    query(['page', 'limit']).exists().withMessage('must be provided').isInt({
        min: 1
    }).withMessage('must ba a non-zero positive integer')
];

export async function ordersGet(req: Request<any, any, any, OrdersGetRequestQuery>, res: Response) {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return sendUnprocessableEntryResponse(res, err);
    }

    const limit = parseInt(req.query.limit, 10);
    const page = parseInt(req.query.page, 10);

    try {

        const orders = await Order.findAll({
            limit,
            offset: (page - 1) * limit,
            attributes: ['id', 'distance', 'status'],
            order: [['created_at', 'DESC']]
        });

        res.send(orders);
    } catch (err) {
        log.error('Failed to query', err);
        res.status(500);
        res.send({
            "error": 'Internal server error'
        });
    }
}
