import { Channel } from 'amqplib'
import { Connection, Publisher } from 'amqplib-plus'
import { Stats, StatsModel } from '../model/Stats'
import { Types } from 'mongoose'
import { Parser } from 'fast-json-parser'
import stringify from 'fast-json-stable-stringify'

export interface configInit {
    kafkaTopicName: string;
    rabbitExchangeName: string;
    rabbitQueueOutputName: string;
    rabbitRoutKeyName: string;
}


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

    constructor (private publis: Publisher) {
        this.statsModel = new Stats()
        //this.publisher = new Publisher(this.amqpConn, this.preparePublisher)
    }
    
    async proMsg(dataMessage: string, iniConf: configInit): Promise<void> {
        const dataParse: ProducerMessage = Parser.parse(dataMessage)

        const fulldate = new Date(dataParse.date)
        /*
        console.log(fulldate.getDate())
        console.log(fulldate.getFullYear())
        console.log(fulldate.getMonth())
        console.log(fulldate.getDay())
        console.log(fulldate.getUTCDate())
        console.log(fulldate.getHours())
        console.log(fulldate.getMinutes())
        */
        
        //const dataProd = fulldate.getFullYear()+'-'+fulldate.getMonth()+'-'+fulldate.getDate()+'-'+fulldate.getHours()+'-'+fulldate.getMinutes()
        const dataProd = fulldate.getFullYear()+''+fulldate.getMonth()+''+fulldate.getDate()+''+fulldate.getHours()
        //console.log(dataProd)// 2020-9-11-12-21

        const endpoint_p = dataParse.uri
        const metodo_p = dataParse.method
        const status_p = dataParse.status
        const latencia_p = dataParse.request_time

        await Stats.findOne({dt: dataProd, ep: endpoint_p, me: metodo_p, sc: status_p}, async (err, result) => {
            if (err) throw err

            if (!result) {
                console.log('criou', result)
                this.statsModel.ep = endpoint_p
                this.statsModel.me = metodo_p
                this.statsModel.sc = status_p
                this.statsModel.lt = parseFloat(latencia_p)
                this.statsModel.rt = 1
                this.statsModel.dt = dataProd
                await this.statsModel.save().then(async () => {
                    const resultProccess = {dt: dataProd, ep: endpoint_p, me: metodo_p, sc: status_p, lt: latencia_p, rt: 1}
                    await this.publis.sendToQueue(iniConf.rabbitQueueOutputName, Buffer.from(stringify(resultProccess)), {})
                })
            } else {
                //const newLtc  = Math.round(result.lt * 100 ) / 100 + parseFloat(latencia_p)
                const newLtc  = (result.lt * 100 ) / 100 + parseFloat(latencia_p)
                const latMed  = newLtc / 2 
                //const latmefi = Math.round(latMed * 100 ) / 100
                const latmefi = ( latMed * 100 ) / 100
                const filter  = {_id: Types.ObjectId(result._id)};
                const update = {
                    $set: {
                        ep: endpoint_p, 
                        me: metodo_p, 
                        sc: status_p,
                        lt: latmefi,
                        dt: dataProd
                    },
                    $inc: { rt: 1 }
                };
                let doc = await Stats.findOneAndUpdate(filter, update)
                if (doc) {
                    console.log(' =>>> ', doc)
                    const resultProccess = {dt: dataProd, ep: doc.ep, me: doc.me, sc: doc.sc, lt: doc.lt, rt: doc.rt}
                    await this.publis.sendToQueue(iniConf.rabbitQueueOutputName, Buffer.from(stringify(resultProccess)), {})
                    //await this.publis.publish(iniConf.rabbitExchangeName, iniConf.rabbitRoutKeyName, Buffer.from(stringify(resultProccess)), {});
                } else {
                    console.log(' doc.ep nao encontrado ', doc)
                }
            }
        })

        //}).lean()
    }
}