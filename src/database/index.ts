import mongoose, { Mongoose } from 'mongoose';

const mongoUri = 'mongodb+srv://processor:ht8caf9UofmSTKNt@cluster0.8bvv8.gcp.mongodb.net/pipe2be?retryWrites=true&w=majority'
//const mongoUri = 'mongodb://localhost:27017'
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