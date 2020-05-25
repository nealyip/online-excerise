import {Express} from "express";
import {
    notFound,
    orderPatch,
    orderPost,
    ordersGet,
    OrderPatchValidation,
    OrdersGetValidation,
    OrderPostValidation
} from "./controllers";

export function routes(app: Express) {
    app.get('/', notFound);

    app.post('/orders', OrderPostValidation, orderPost);

    app.patch('/orders/:id', OrderPatchValidation, orderPatch);

    app.get('/orders', OrdersGetValidation, ordersGet);

    app.all('*', notFound);
}
