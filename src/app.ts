import * as database from './config/database-config'
import { KafkaService } from './services/kafka-service'
import { configInit, StatsController } from './controller/Stats'
import { AmqpService } from './services/amqp-service'
import { Logger } from 'winston'
import { Connection, Publisher } from 'amqplib-plus'
import { Channel } from 'amqplib'
import { optionsAmqp } from './config/amqp-config'

export class Application {
    private kafkaInstance: KafkaService
    private amqpInstance: AmqpService

    constructor(private logger: Logger){}

    public init(config: configInit): void {
        this.startUp(config)
    }

    private async initDatabase(): Promise<void> {
        try {
            await database.connect()
            this.logger.debug('[DATABASE_CONNECT_SUCCESS]')
        } catch (error) {
            this.logger.error('[DATABASE_CONNECT_ERROR]')
            throw new Error('Database not connected')
        }
    }

    private async initKafka(): Promise<void> {
        this.kafkaInstance = new KafkaService()
    }

    private async startUp(iniConf: configInit): Promise<void> {

        await this.initKafka()
        const kClient = await this.kafkaInstance.initClient()
        kClient.on('ready', async () => {

            this.logger.debug('[KAFKA_CONNECT_SUCCESS]')

            const connection = new Connection(optionsAmqp)
            connection.shouldRecreateConnection(true)
            const c = await connection.connect()
            c.on("close", (err) => { this.logger.debug('[AMQP_CLOSE]', err) })
            c.on("error", (err) => { this.logger.debug('[AMQP_ERROR]', err) })

            const preparePublisher = async (ch: Channel) => {
                await ch.assertQueue(iniConf.rabbitQueueOutputName, { durable: false })
                await ch.assertExchange(iniConf.rabbitExchangeName, "direct")
                await ch.bindQueue(iniConf.rabbitQueueOutputName, iniConf.rabbitExchangeName, iniConf.rabbitRoutKeyName)
                this.logger.debug('[AMQP_PUBLISHER_SUCCESS]', iniConf.rabbitQueueOutputName)
            }

            const publisher = new Publisher(connection, preparePublisher)

            this.logger.debug('[AMQP_CONNECT_SUCCESS]')

            await this.initDatabase()

            const statsConsumer = new StatsController(publisher)
            const topico = iniConf.kafkaTopicName
            const ksumer = await this.kafkaInstance.Ksumer(kClient, topico)

            ksumer.on('message', async (message) => {
                await statsConsumer.proMsg(message.value.toString(), iniConf)
            })
            ksumer.on('error', (e: Error) => {
                this.logger.error('[ON_CONSUMER_KAFKA_ERROR]', e)
            })
            ksumer.once('error', (e: Error) => {
                this.logger.error('[ONCE_CONSUMER_KAFKA_ERROR]', e)
                if (e.name === 'TopicsNotExistError') {
                    const topicsToCreate = [{
                        topic: topico,
                        partitions: 1,
                        replicationFactor: 1
                    }];
                    kClient.createTopics(topicsToCreate, async (err, result) => {
                        if (err) throw err

                        await database.close()
                        await this.amqpInstance.close()
                        this.startUp(iniConf)
                    })
                }
            })
            //}).catch(this.logger.error)
        })
        kClient.on('error', (e: Error) => {
            this.logger.error('[KAFKA_CONNECT_ERROR]', e)
        })
    }
}

/*
(async () => {
    await database.connect().then(async () => {
        logger.debug('[DATABASE_CONNECT_SUCCESS]')
        const kafkaService  = new KafkaService()
        const kafkaInstance = await kafkaService.initClient()
        kafkaInstance.on('ready', async () => {
            logger.debug('[KAFKA_CONNECT_SUCCESS]')
            const amqpService = new AmqpService(logger);
            await amqpService.connect().then(async (c) => {
                const amqpConn = await amqpService.conn();

                c.on("ready", () => {

                    console.log('conexão RABBIT PRONTA')
                });
                c.on("close", (err) => {
                    if (err) {
                        throw err
                        //this.conn = null;
                        //return this.retryConnection();
                    }

                    console.log('conexão fechada')
                });
                c.on("error", (err) => {
                    if (err) {
                        throw err
                    }
                    console.log('conexão error')
                });
                
                logger.debug('[AMQP_CONNECT_SUCCESS]')

                const 
                    statsConsumer = new StatsController(amqpConn),
                    topico = '1s5e8w',// mesmo valor criado na '.env' do container
                    autocommit = true,
                    particao = 0,
                    ksumer = await kafkaService.Ksumer(kafkaInstance, topico, particao, autocommit);
                ksumer.on('error', (e: Error) => {
                    logger.error('[CONSUMER_KAFKA_ERROR]', e.message)
                    if (e.name === 'TopicsNotExistError') {
                        const topicsToCreate = [{
                            topic: topico,
                            partitions: 1,
                            replicationFactor: 1
                        }];
                        kafkaInstance.createTopics(topicsToCreate, (err, result) => {
                            if (err) {
                                throw err
                            }
                            console.log(result)
                        })
                    }
                })
                ksumer.on('message', async (message) => {
                    await statsConsumer.proMsg(message.value.toString())
                })
            }).catch(logger.error)
        })
        kafkaInstance.on('error', (e) => {
            logger.error('[KAFKA_CONNECT_ERROR]', e)
        })
    }).catch((e) => {
        logger.error('[DATABASE_CONNECT_ERROR]', e)
    });
})().catch(logger.error);
*/