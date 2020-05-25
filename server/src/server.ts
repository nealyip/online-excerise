import * as express from 'express';
import {routes} from "./routes";
import {json} from 'body-parser';
import * as log from 'loglevel';
import * as moment from 'moment-timezone';
import {Request, Response} from "express";
import {stringify} from "querystring";

log.setLevel(log.levels[process.env.LOGLEVEL || 'INFO']);

const app = express();
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 8080;

app.use(json());
app.use((req: Request, res: Response, next) => {
    const reqBody = req.body ? JSON.stringify(req.body) : '';
    log.info(`${moment().tz('Asia/Hong_Kong').toISOString(true)} ${req.method}` +
        ` ${req.url} ${req.ip} ${res.statusCode} ${reqBody.length} ${stringify(req.headers)} ${stringify(req.query as any)} ${reqBody}`)
    next();
});

app.use((error, req: Request, res: Response, next) => {
    if (error instanceof SyntaxError) {
        res.status(400).send({"error": "Bad request"});
    } else {
        res.status(500).send({"error": "Internal server error"});
    }
});

routes(app);

const server = app.listen(port, () => console.log(`Listening at http://127.0.0.1:${port}`));
