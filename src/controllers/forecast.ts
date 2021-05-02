import {ClassMiddleware, Controller, Get} from '@overnightjs/core';
import {Request, Response} from 'express';
import {Forecast} from "@src/services/forecast";
import {Beach} from "@src/models/beach";
import {authMiddleware} from "../middlewares/auth";
import logger from "@src/logger";

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
    @Get('')
    public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
        try {
            const user = req.decoded?.id;
            const beaches = await Beach.find({user});
            const forecastData = await forecast.processForecastForBeaches(beaches);
            res.status(200).send(forecastData);
        } catch (e) {
            logger.error(e);
            res.status(500).send({error: 'Something went wrong'});
        }
    }
}
