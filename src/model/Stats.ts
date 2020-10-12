import mongoose, { Document, Model, Schema } from 'mongoose';

interface IStats {
  _id?: string;
  ep: string;// endpoint
  me: string;// method
  sc: string;// status code
  lt: number;// latency
  rt: number;// total requests
  dt: string;
}

const StatsSchema = new Schema(
  {
    ep: { type: String, required: true },
    me: { type: String, required: true },
    sc: { type: String, required: true },
    lt: { type: Number, required: true },
    rt: { type: Number, required: true },
    dt: { type: String, required: true }
  }
);

export interface StatsModel extends Omit<IStats, '_id'>, Document {}
export const Stats: Model<StatsModel> = mongoose.model('Stats', StatsSchema);