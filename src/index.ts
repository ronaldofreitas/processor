import { Connection as AMQPConnect } from 'amqplib-plus'
import * as database from './database'
import { KafkaService } from './services/kafka-service'
import { Parser } from "fast-json-parser"
import { StatsController } from './controller/Stats'

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

        return await database.connect().then(async () => {

            const kafkaService  = new KafkaService()
            const kafkaInstance = await kafkaService.initClient()
    
            const amqpConn = new AMQPConnect({ connectionString: 'amqps://feadhfit:XMb8d1vGS5_jhrPjm4jlRmW7Te8CnYwr@crane.rmq.cloudamqp.com/feadhfit' }, console)
            await amqpConn.connect()
    
            const statsConsumer = new StatsController(amqpConn)
            
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
                await statsConsumer.proMsg(dataMessage)
            })
        }).catch((e) => {
            return e
        });

    } catch (error) {
        console.log(error)
    } 
})().catch(console.error);
