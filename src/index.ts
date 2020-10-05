import * as database from './database'
import { KafkaService } from './services/kafka-service'
import { Parser } from "fast-json-parser"
import { StatsController } from './controller/Stats'
import { AmqpService } from './services/amqp-service'
import logger from './util/logger'

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
    await database.connect().then(async () => {
        logger.debug('[DATABASE_CONNECT_SUCCESS]')
        const 
            kafkaService  = new KafkaService(),
            kafkaInstance = await kafkaService.initClient();
            
        kafkaInstance.on('error', (e) => {
            logger.error('[KAFKA_CONNECT_ERROR]', e)
        })
        kafkaInstance.on('ready', async () => {
            logger.debug('[KAFKA_CONNECT_SUCCESS]')
            const amqpService = new AmqpService(logger);
            await amqpService.connect().then(async () => {
                const amqpConn = await amqpService.conn();
                logger.debug('[AMQP_CONNECT_SUCCESS]')
                const 
                    statsConsumer = new StatsController(amqpConn),
                    topico = '1s5e8w',// mesmo valor criado na '.env' do container
                    autocommit = true,
                    particao = 0,
                    ksumer = await kafkaService.Ksumer(kafkaInstance, topico, particao, autocommit);
        
                ksumer.on('error', (e) => {
                    logger.error('[CONSUMER_KAFKA_ERROR]', e)
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
            }).catch(logger.error)
        })
    }).catch((e) => {
        logger.error('[DATABASE_CONNECT_ERROR]', e)
    });
})().catch(logger.error);
