import { Channel } from 'amqplib'
import { Connection, Publisher } from 'amqplib-plus'
import { Stats, StatsModel } from '../model/Stats'
import { Types } from 'mongoose'
import { Parser } from 'fast-json-parser'
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

export class StatsController {

    private statsModel: StatsModel
    private publisher: Publisher
    private queueName: string
    private queueDestinationName: string
    private exchangeName: string

    constructor (
        private amqpConn: Connection, 
        private amqpExchangeName: string,
        private amqpQueueName: string, 
        private queueDestinationOutput: string
    ) {
        this.statsModel = new Stats()
        this.publisher = new Publisher(this.amqpConn, this.preparePublisher)
        this.queueName = this.amqpQueueName
        this.exchangeName = this.amqpExchangeName
        this.queueDestinationName = this.queueDestinationOutput
    }

    async preparePublisher (ch: Channel) {
        await ch.assertQueue(this.queueName, { durable: false })
        //await ch.assertExchange(this.exchangeName, 'direct')
        //await ch.bindQueue(this.queueName, 'target-exchange', 'routKey')
        console.log('AmqpPublisher ready')
    }
    
    async proMsg(dataMessage: string): Promise<void> {
        const dataParse: ProducerMessage = Parser.parse(dataMessage)
        const endpoint_p = dataParse.uri
        const metodo_p = dataParse.method
        const status_p = dataParse.status
        const latencia_p = dataParse.request_time

        //const data_atual = new Date()
        //await Stats.findOne({ep: endpoint_p, me: metodo_p, sc: status_p, dt: data_atual}, async (err, result) => {

        await Stats.findOne({ep: endpoint_p, me: metodo_p, sc: status_p}, async (err, result) => {
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
                    await this.publisher.sendToQueue(this.queueDestinationName, Buffer.from(stringify(resultProccess)), {})
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
                let doc = await Stats.findOneAndUpdate(filter, update);
                if (doc) {
                    console.log(' =>>> ', doc)
                    const resultProccess = {ep: doc.ep, me: doc.me, sc: doc.sc, lt: doc.lt, rt: doc.rt};
                    await this.publisher.sendToQueue(this.queueDestinationName, Buffer.from(stringify(resultProccess)), {})
                } else {
                    console.log(' doc.ep nao encontrado ', doc)
                }
            }
        })
        //}).lean()
    }
}