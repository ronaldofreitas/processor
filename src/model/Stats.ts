import mongoose, { Document, Model } from 'mongoose';

interface Stats {
  _id?: string;
  ep: string;// endpoint - path
  me: string;// method
  sc: number;// status code
  lt: number;// latency
  tm: number;// timestamp
}

const schema = new mongoose.Schema(
  {
    ep: { type: String, required: true },
    me: { type: String, required: true },
    sc: { type: Number, required: false },
    lt: { type: Number, required: true },
    tm: { type: Number, required: true },
  }
);

interface StatsModel extends Omit<Stats, '_id'>, Document {}
export const Stats: Model<StatsModel> = mongoose.model('Stats', schema);


/*
import mongoose, { Document, Model } from 'mongoose';

interface Stats {
  _id?: string;
  ep: string;// endpoint - path
  me: string;// method
  sc: number;// status code
  lt: number;// latency
  tm: number;// timestamp
}

const schema = new mongoose.Schema(
  {
    ep: { type: String, required: true },
    me: { type: String, required: true },
    sc: { type: Number, required: false },
    lt: { type: Number, required: true },
    tm: { type: Number, required: true },
  }
);

interface StatsModel extends Omit<Stats, '_id'>, Document {}
export const Stats: Model<StatsModel> = mongoose.model('Stats', schema);
*/