import { Message, Channel } from "amqplib";
import { Connection, Consumer, createChannelCallback } from "amqplib-plus";
import mongoose, { Model, Schema } from "mongoose";
//import { Mongoose } from 'mongoose';
//import { Stats } from "src/model/Stats";

interface ProducerMessage {
    ui: string;
    dt: Date;
    tm: number;
    ep: string;
    me: string;
    sc: number;
    lt: string;
}
interface statsModel {

}
export class StatsConsumer extends Consumer {

    //private dbCli: Mongoose
    private statsSchema: Schema
    //private Stats: Model<statsModel>

    constructor (conn: Connection, prepareFn: createChannelCallback) {
    //constructor (dbConn: Mongoose, conn: Connection, prepareFn: createChannelCallback) {
        super(conn, prepareFn, false, console)

        //this.dbCli = dbConn
        this.statsSchema = new Schema({}, { strict: false });
        //const modelStats = mongoose.model('Stats', this.statsSchema);
        //this.Stats = new modelStats()
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

        const resultProccess = JSON.stringify(msgRetorno)
        const modelStats = mongoose.model('Stats', this.statsSchema);
        const statsModel = new modelStats(dataParse)
        const save = await statsModel.save()
        console.log('MENSAGEM', dataParse)
/*
const dataInsert = {"id_usuario":
[
    {"total_requests":5000},
    {"2020-10-25": 
        [
            {"14":
                [
                    {
                    "endpoints": 
                        [
                            {"/usuario": 
                                [
                                    {
                                        "status": 200, 
                                        "metodo": "POST",
                                        "total_requests": 73,
                                        "latencia_media": "0.54"
                                    },
                                    {
                                        "status": 200, 
                                        "metodo": "GET",
                                        "total_requests": 245,
                                        "latencia_media": "0.54"
                                    },
                                    {
                                        "status": 500, 
                                        "metodo": "POST",
                                        "total_requests": 1,
                                        "latencia_media": "0.54"
                                    }
                                ]
                            },
                            {"/": 
                                [
                                    {
                                        "status": 200, 
                                        "metodo": "GET",
                                        "total_requests": 445,
                                        "latencia_media": "0.54"
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "total_requests": 245, 
            },
            {"17":
                [
                    {}
                ],
                "total_requests": 245, 
            },
        ],
        "total_requests": 245
    },
    
]
}

        const modelStats = mongoose.model('Stats', this.statsSchema);
        const statsModel = new modelStats(dataInsert)
        const save = statsModel.save()
        console.log('SAVE MONGO',save)
        */
        //const stats = new Stats(dataInsert)
        //const save = await stats.save();
        
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