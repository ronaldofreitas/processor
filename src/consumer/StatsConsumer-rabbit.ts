/*
import { Message, Channel } from "amqplib";
import { Connection, Consumer, createChannelCallback } from "amqplib-plus";
import { Stats, StatsModel } from "../model/Stats";
import { Types } from 'mongoose';

interface ProducerMessage {
    ui: string;
    dt: Date;
    tm: number;
    ep: string;
    me: string;
    sc: number;
    lt: string;
}

export class StatsConsumer extends Consumer {

    private statsModel: StatsModel
    private statsModelFind: typeof Stats

    constructor (conn: Connection, prepareFn: createChannelCallback) {
        super(conn, prepareFn, false, console)

        this.statsModel = new Stats()
        this.statsModelFind = Stats
    }

    async processMessage(msg: Message, channel: Channel): Promise<void> {
        // console.log('Message headers:', JSON.stringify(msg.properties.headers))
        // console.log('Message body:', msg.content.toString(), '\n')
        //console.log(msg.content.toString(), '\n')
        
        const dataParse: ProducerMessage = JSON.parse(msg.content.toString())

        // Your own condition to decide whether to ack/nack/reject
        if (msg.content.toString().length > 10) {
            // return channel.nack(msg)
        }

        const msgRetorno = {
            updateAt: new Date(),
            mensagem: `endpoint '${dataParse.ep}' acessado via '${dataParse.me}' com status '${dataParse.sc}'`
        }

        await this.statsModelFind.findOne({ep: dataParse.ep, me: dataParse.me, sc: dataParse.sc}, async (err, result) => {
            if (err) throw err

            console.log(result,'\n')

            // se existe = update
            // se não existe = save

            if (!result) {
                console.log('CRIOU','\n')
                this.statsModel.ep = dataParse.ep
                this.statsModel.me = dataParse.me
                this.statsModel.sc = dataParse.sc
                this.statsModel.lt = parseFloat(dataParse.lt)
                this.statsModel.rt = 1
                await this.statsModel.save()
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
                } else {
                    console.log(' doc.ep nao encontrado ', doc)
                }
            }
        })

        const resultProccess = JSON.stringify(msgRetorno)
        
        if (msg.properties.replyTo) {
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(resultProccess), {
                correlationId: msg.properties.correlationId,
                appId: "app1.default.local.svc",
                timestamp: Date.now()
              });
            channel.ack(msg);
        } else {
            channel.ack(msg)
        }
    }
}
*/