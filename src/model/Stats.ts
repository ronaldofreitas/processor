import mongoose, { Document, Model, Schema } from 'mongoose';

interface IStats {
  _id?: string;
  ep: string;// endpoint
  me: string;// method
  sc: number;// status code
  lt: number;// latency
  rt: number;// total requests
}

const StatsSchema = new Schema(
  {
    ep: { type: String, required: true },
    me: { type: String, required: true },
    sc: { type: Number, required: true },
    lt: { type: Number, required: true },
    rt: { type: Number, required: true }
  }
);

/*
StatsSchema.pre('findOneAndUpdate', function (next) {
  console.log('------------->>>>>> findOneAndUpdate: ');
  const docToUpdate = Stats.findOne(this.getFilter());
  this._update.$set.objects = [];
  this._update.$set.people = [];
  this._update.$set.events =  [];
  next();
});
*/

export interface StatsModel extends Omit<IStats, '_id'>, Document {}
export const Stats: Model<StatsModel> = mongoose.model('Stats', StatsSchema);