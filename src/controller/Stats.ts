import { Channel } from "amqplib"
import { Connection, Publisher } from "amqplib-plus"
import { Stats, StatsModel } from "../model/Stats"
import { Types } from 'mongoose'

interface ProducerMessage {
    ui: string;
    dt: Date;
    tm: number;
    ep: string;
    me: string;
    sc: number;
    lt: string;
}

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

        const dataParse: ProducerMessage = JSON.parse(dataMessage)
        
        /*
        const msgRetorno = {
            updateAt: new Date(),
            mensagem: `endpoint '${dataParse.ep}' acessado via '${dataParse.me}' com status '${dataParse.sc}'`
        }
        */

        await this.statsModelFind.findOne({ep: dataParse.ep, me: dataParse.me, sc: dataParse.sc}, async (err, result) => {
            if (err) throw err

            if (!result) {
                console.log('CRIOU','\n')
                this.statsModel.ep = dataParse.ep
                this.statsModel.me = dataParse.me
                this.statsModel.sc = dataParse.sc
                this.statsModel.lt = parseFloat(dataParse.lt)
                this.statsModel.rt = 1
                await this.statsModel.save().then(async () => {
                    const resultProccess = `{ep: '${dataParse.ep}', me: '${dataParse.me}', sc: ${dataParse.sc}, lt: ${dataParse.lt}, rt: 1}`;
                    await this.publisher.sendToQueue('pos-stats-consumer', Buffer.from(resultProccess), {})
                })
            } else {
                const newLtc = Math.round(result.lt * 100 ) / 100 + parseFloat(dataParse.lt)
                const latMed = newLtc / 2 
                const latmefi = Math.round(latMed * 100 ) / 100
                const filter = {_id: Types.ObjectId(result._id)};
                const update = {
                    $set: {
                        ep: dataParse.ep, 
                        me: dataParse.me, 
                        sc: dataParse.sc,
                        lt: latmefi,
                    },
                    $inc: { rt: 1 }
                };
                let doc = await this.statsModelFind.findOneAndUpdate(filter, update);
                if (doc) {
                    console.log(' =>>> ', doc)
                    const resultProccess = `{ep: '${doc.ep}', me: '${doc.me}', sc: ${doc.sc}, lt: ${doc.lt}, rt: ${doc.rt}}`;
                    await this.publisher.sendToQueue('pos-stats-consumer', Buffer.from(resultProccess), {})
                } else {
                    console.log(' doc.ep nao encontrado ', doc)
                }
            }
        })
    }
}