import {Response} from "express";
import {Result, ValidationError} from "express-validator";
import * as moment from 'moment-timezone';
import {get as getHttps} from 'https';
import {stringify} from "querystring";
import * as log from 'loglevel';

log.setLevel(log.levels[process.env.LOGLEVEL || 'INFO']);

export function sendUnprocessableEntryResponse(res: Response, err: Result<ValidationError>) {

    const firstError = err.array()[0];
    res.status(422);
    res.send({
        "error": `${firstError.param} ${firstError.msg}`
    })
    return;
}

export function now(): Date {
    return moment().tz('UTC').toDate();
}

export async function get(url): Promise<string> {
    return new Promise((resolve, reject) => {
        getHttps(url, res => {
            let buffer = '';
            res.on('data', d => {
                buffer += d;
            });
            res.on('end', () => {
                resolve(buffer);
            })
        }).on('error', e => {
            reject(e);
        })
    });
}

export async function getDistance(origin: [string, string], destination: [string, string]): Promise<number> {
    const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    const query = {
        origin: origin.join(','),
        destination: destination.join(','),
        key: process.env.GCP_API_KEY
    }
    const url = baseUrl + '?' + stringify(query);
    const result = await get(url);

    log.info('Got response from GCP', result);

    const response = JSON.parse(result);

    if (response.error_message) {
        throw new Error(response.error_message);
    }
    if (!response.routes || !response.routes[0] || !response.routes[0].legs || !response.routes[0].legs[0].distance) {
        throw new Error('Unknown response format from GCP.'); // Unknown response
    }
    const distance = response.routes[0].legs[0].distance.value;
    if (typeof distance !== "number"){
        throw new Error('Unknown response format from GCP.'); // Unknown response
    }
    return distance;
}
