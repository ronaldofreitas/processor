/*
import { Connection as AMQPConnect } from 'amqplib-plus'
import { Channel } from 'amqplib'
import { StatsConsumer } from './consumer/StatsConsumer'
import * as database from './database'
import { KafkaService } from './services/kafka-service';
import { Parser } from "fast-json-parser";
import { AmqpPublisher } from './services/amqp-publisher';

interface ProxyMessageNginx {
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

(async () => {
    try {

        await database.connect()

        const kafkaService  = new KafkaService('172.17.0.3:9092');
        const kafkaInstance = await kafkaService.initClient();

        const amqpConn = new AMQPConnect({ connectionString: 'amqps://feadhfit:XMb8d1vGS5_jhrPjm4jlRmW7Te8CnYwr@crane.rmq.cloudamqp.com/feadhfit' }, console)
        await amqpConn.connect()

        const prepareConsumer = async (ch: Channel) => {
            await ch.assertQueue('stats-consumer-pre', { durable: false })
            await ch.prefetch(5)
        }
        const statsConsumer = new StatsConsumer(amqpConn, prepareConsumer)
        await statsConsumer.consume('stats-consumer-pre', {})

        const preparePublisher = async (ch: Channel) => {
            //await ch.assertQueue('stats-consumer-pre', { durable: false,  exclusive: true...deadLetterExchange })
            await ch.assertQueue('stats-consumer-pre', { durable: false })
            await ch.assertExchange('target-exchange', 'direct')
            await ch.bindQueue('stats-consumer-pre', 'target-exchange', 'routKey')
            console.log('AmqpPublisher ready')
        }
        const publisher = new AmqpPublisher(amqpConn, preparePublisher)

        const 
            topico = '1s5e8w',// mesmo valor criado na '.env' do container
            autocommit = true,
            particao = 0,
            ksumer = await kafkaService.Ksumer(kafkaInstance, topico, particao, autocommit);

        ksumer.on('error', (e) => {
            console.log('[CONSUMER-KAFKA-ERROR]', e)
        })
        ksumer.on('message', async (message) => {
            const 
                bodyMessage: string | Buffer = message.value,
                mensagem: ProxyMessageNginx = Parser.parse(bodyMessage.toString());
            const 
                dt = new Date(mensagem.date),
                tm = dt.getTime(),
                ep = mensagem.uri,
                me = mensagem.method,
                sc = mensagem.status,
                lt = mensagem.request_time;
        
            const dataMessage = JSON.stringify({ep, me, sc, lt, tm})
            await publisher.sendToQueue('pos-stats-consumer', Buffer.from(dataMessage), {})
            
            await publisher.publish(
                'target-exchange', 
                'routKey', 
                Buffer.from(dataMessage), 
                {
                    replyTo: 'result-processor'
                }
            )
            
            console.log(dataMessage)
        })

    } catch (error) {
        console.log(error)
    } 
})().catch(console.error);
*/
