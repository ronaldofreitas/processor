import mongoose, { Mongoose } from 'mongoose';

/*
const 
  db_name = 'pipe2be',
  db_user = 'processor',
  db_pass = 'ht8caf9UofmSTKNt',
  db_host = 'cluster0.8bvv8.gcp.mongodb.net',
  mongoUri = `mongodb+srv://${db_user}:${db_pass}@${db_host}/${db_name}?retryWrites=true&w=majority`;
*/

//const mongoUri = 'mongodb://root:rootpassword@172.17.0.5:27017/processor'
const mongoUri = 'mongodb://root:rootpassword@172.17.0.5:27017/processor?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false'

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    connectTimeoutMS: 1000,
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  });

export const close = (): Promise<void> => mongoose.connection.close();