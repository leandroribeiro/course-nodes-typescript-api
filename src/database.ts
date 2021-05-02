import config, { IConfig } from 'config';
import mongoose, { Mongoose } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

export const connect2 = async (connection: string): Promise<Mongoose> =>
    await mongoose.connect(connection, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(dbConfig.get('mongoUrl'), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();
