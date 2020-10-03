import { Message, Channel } from "amqplib";
import { Connection, Consumer, createChannelCallback } from "amqplib-plus";
import Stats from "../entity/Stats";
import { Connection as ConnTypeORM, Repository } from "typeorm";

export class StatsController extends Consumer {

    private statsRepo: Repository<Stats>
    private statsEntity: Stats

    constructor (connPostgres: ConnTypeORM, conn: Connection, prepareFn: createChannelCallback) {
        super(conn, prepareFn, false, console)

        this.statsEntity = new Stats();
        this.statsRepo = connPostgres.getRepository(Stats);
    }

    async processMessage(msg: Message, channel: Channel): Promise<void> {
        // console.log('Message headers:', JSON.stringify(msg.properties.headers))
        // console.log('Message body:', msg.content.toString(), '\n')
        //console.log(msg.content.toString(), '\n')

        // Your own condition to decide whether to ack/nack/reject
        if (msg.content.toString().length > 10) {
            // return channel.nack(msg)
        }

        const getItems = await this.statsRepo.find({})
        const mensagem_parse = JSON.parse(msg.content.toString())
        const resultProccess = '{total:  '+getItems.reverse()[0].id + ",  metodo: "+mensagem_parse.me+"}"
        this.statsEntity.mensagem = resultProccess

        /*
        console.log('------------------------------------')
        console.log(getItems.reverse()[0].id)
        console.log(getItems[0].mensagem)
        console.log('------------------------------------')
        */
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

        await this.statsRepo.save(this.statsEntity)
    }

}