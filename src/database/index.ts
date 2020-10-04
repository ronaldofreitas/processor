//import config, { IConfig } from 'config';
import mongoose, { Mongoose } from 'mongoose';

//const dbConfig: IConfig = config.get('App.database');

//
//const mongoUri = 'mongodb+srv://processor:ht8caf9UofmSTKNt@cluster0.xqko9.mongodb.net/pipe2be?retryWrites=true&w=majority'
const mongoUri = 'mongodb+srv://processor:ht8caf9UofmSTKNt@cluster0.8bvv8.gcp.mongodb.net/pipe2be?retryWrites=true&w=majority'
export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();