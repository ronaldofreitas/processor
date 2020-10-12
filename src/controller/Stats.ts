import { Publisher } from 'amqplib-plus'
import { Stats, StatsModel } from '../model/Stats'
import { Types } from 'mongoose'
import { Parser } from 'fast-json-parser'
import stringify from 'fast-json-stable-stringify'
import logger from "../util/logger"

export interface configInit {
    kafkaTopicName: string;
    rabbitExchangeName: string;
    rabbitExchangeType: string;
    rabbitQueueOutputName: string;
    rabbitRoutKeyName: string;
}

// ui: string;
interface ProxyMessage {
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
    }
    
    async proMsg(dataMessage: string, iniConf: configInit): Promise<void> {
        const dataParse: ProxyMessage = Parser.parse(dataMessage)
        const fulldate = new Date(dataParse.date)
        const data_mes = fulldate.getMonth().toString()
        let dt_mes = data_mes
        if (data_mes?.length <= 1) {
            dt_mes = `0${data_mes}`
        }
        const dataProd = fulldate.getFullYear()+''+dt_mes+''+fulldate.getDate()+''+fulldate.getHours()
        const endpoint_p = dataParse.uri
        const metodo_p = dataParse.method
        const status_p = dataParse.status
        const latencia_p = dataParse.request_time
        
        await Stats.findOne({dt: dataProd, ep: endpoint_p, me: metodo_p, sc: status_p}, async (err, result) => {
            if (err) {
                logger.error(err)
                throw err
            }
            if (!result) {
                this.statsModel.ep = endpoint_p
                this.statsModel.me = metodo_p
                this.statsModel.sc = status_p
                this.statsModel.lt = parseFloat(latencia_p)
                this.statsModel.rt = 1
                this.statsModel.dt = dataProd
                await this.statsModel.save().then(async () => {
                    const resultProccess = {dt: dataProd, ep: endpoint_p, me: metodo_p, sc: status_p, lt: latencia_p, rt: 1}
                    await this.publis.sendToQueue(iniConf.rabbitQueueOutputName, Buffer.from(stringify(resultProccess)), {})
                }).catch((e) => {
                    logger.error(e)
                })
            } else {
                const newLtc  = (result.lt * 100 ) / 100 + parseFloat(latencia_p) //Math.round(result.lt * 100 ) / 100 + parseFloat(latencia_p)
                const latMed  = newLtc / 2 
                const latmefi = ( latMed * 100 ) / 100 //Math.round(latMed * 100 ) / 100
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
                    const resultProccess = {dt: dataProd, ep: doc.ep, me: doc.me, sc: doc.sc, lt: doc.lt, rt: doc.rt}
                    await this.publis.sendToQueue(iniConf.rabbitQueueOutputName, Buffer.from(stringify(resultProccess)), {})
                    //await this.publis.publish(iniConf.rabbitExchangeName, iniConf.rabbitRoutKeyName, Buffer.from(stringify(resultProccess)), {});
                } else {
                    logger.warn('não foi possível findOneAndUpdate', doc)
                }
            }
        })//.lean()
    }
}