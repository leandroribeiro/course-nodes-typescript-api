import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import express, { Application } from 'express';
import * as database from '@src/database';
import * as http from 'http';
import { BeachesController } from './controllers/beaches';

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(express.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();

    this.addControllers([forecastController, beachesController]);
  }

  private async databaseSetup(): Promise<void> {
    try {
      await database.connect();
    } catch {
      throw new Error(' >>>>>>>>>>>> ERROR TO CONNECT DATABASE !!!');
    }
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      console.log('Server listening on port: ' + this.port);
    });
  }
}
