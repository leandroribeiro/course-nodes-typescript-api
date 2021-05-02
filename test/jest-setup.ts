import { SetupServer } from '@src/server';
import supertest from 'supertest';
import config from "config";

let server: SetupServer;
beforeAll(async () => {
  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async () => await server.close());

//setTimeout.js
//jest.setTimeout(4000);
