import {Request, Response} from "express";

export function notFound(req: Request, res: Response){
    res.status(404);
    res.send({'error': 'not_found'});
}
