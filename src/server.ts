import './util/module-alias';
import { Server } from '@overnightjs/core';
import { ForecastController } from './controllers/forecast';
import express, { Application } from 'express';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import * as database from '@src/database';
import { BeachesController } from '@src/controllers/beaches';
import { UsersController } from '@src/controllers/users';
import logger from '@src/logger';
import swaggerUi from 'swagger-ui-express';
import apiSchema from './api.schema.json';
import * as OpenApiValidator from 'express-openapi-validator';
import OpenAPIV3 from 'express-openapi-validator/dist/framework/types';
import path from 'path';
import { apiErrorValidator } from '@src/middlewares/api-error-validator';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(express.json());
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();

    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    try {
      await database.connect();
    } catch (error) {
      logger.info(
        ' <<<<<<<<<<<<<<<< ERROR TO CONNECT DATABASE >>>>>>>>>>>>>>>'
      );
      logger.error(error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await database.close();
  }

  private async docSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    // 4.xx version
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: path.join(__dirname, 'api.schema.json'),
        validateRequests: true,
        validateResponses: true,
      })
    );

    // 3.xx version
    // await new OpenApiValidator({
    //   apiSpec: apiSchema,
    //   validateRequest: true,
    //   validateResponse: true,
    // }).install(this.app);
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('Server listening on port: ' + this.port);
    });
  }
}
