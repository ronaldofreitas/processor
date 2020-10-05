import { Channel } from "amqplib"
import { Connection, Publisher } from "amqplib-plus"
import { Stats, StatsModel } from "../model/Stats"
import { Types } from 'mongoose'
import { Parser } from "fast-json-parser"
import stringify from 'fast-json-stable-stringify'

// ui: string;
interface ProducerMessage {
    date: Date;
    remote_addr: string;
    server_protocol: string;
    request: string;
    uri: string;
    method: string;
    status: string;
    upstream_response_time: string;
    msec: string;
    request_time: string;
}
/*
{
  date: '2020-10-05T16:15:47+00:00',
  remote_addr: '172.17.0.1',
  server_protocol: 'HTTP/1.1',
  request: 'GET / HTTP/1.1',
  uri: '/',
  method: 'GET',
  status: '200',
  upstream_response_time: '0.304',
  msec: '1601914547.040',
  request_time: '0.302'
}
*/
export class StatsController {

    private statsModel: StatsModel
    private statsModelFind: typeof Stats
    private publisher: Publisher

    constructor (amqpConn: Connection) {
        this.statsModel = new Stats()
        this.statsModelFind = Stats
        this.publisher = new Publisher(amqpConn, this.preparePublisher)
    }

    async preparePublisher (ch: Channel) {
        //await ch.assertQueue('stats-consumer-pre', { durable: false,  exclusive: true...deadLetterExchange })
        await ch.assertQueue('pos-stats-consumer', { durable: false })
        //await ch.assertExchange('target-exchange', 'direct')
        //await ch.bindQueue('pos-stats-consumer', 'target-exchange', 'routKey')
        console.log('AmqpPublisher ready')
    }
    
    async proMsg(dataMessage: string): Promise<void> {
        const dataParse: ProducerMessage = Parser.parse(dataMessage)
        const endpoint_p = dataParse.uri
        const metodo_p = dataParse.method
        const status_p = dataParse.status
        const latencia_p = dataParse.request_time
        
        await this.statsModelFind.findOne({ep: endpoint_p, me: metodo_p, sc: status_p}, async (err, result) => {
            if (err) throw err

            if (!result) {
                console.log('CRIOU','\n')
                this.statsModel.ep = endpoint_p
                this.statsModel.me = metodo_p
                this.statsModel.sc = status_p
                this.statsModel.lt = parseFloat(latencia_p)
                this.statsModel.rt = 1
                await this.statsModel.save().then(async () => {
                    const resultProccess = {ep: endpoint_p, me: metodo_p, sc: status_p, lt: latencia_p, rt: 1};
                    await this.publisher.sendToQueue('pos-stats-consumer', Buffer.from(stringify(resultProccess)), {})
                })
            } else {
                const newLtc = Math.round(result.lt * 100 ) / 100 + parseFloat(latencia_p)
                const latMed = newLtc / 2 
                const latmefi = Math.round(latMed * 100 ) / 100
                const filter = {_id: Types.ObjectId(result._id)};
                const update = {
                    $set: {
                        ep: endpoint_p, 
                        me: metodo_p, 
                        sc: status_p,
                        lt: latmefi,
                    },
                    $inc: { rt: 1 }
                };
                let doc = await this.statsModelFind.findOneAndUpdate(filter, update);
                if (doc) {
                    console.log(' =>>> ', doc)
                    const resultProccess = {ep: doc.ep, me: doc.me, sc: doc.sc, lt: doc.lt, rt: doc.rt};
                    await this.publisher.sendToQueue('pos-stats-consumer', Buffer.from(stringify(resultProccess)), {})
                } else {
                    console.log(' doc.ep nao encontrado ', doc)
                }
            }
        })
    }
}