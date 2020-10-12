import * as database from './config/database-config'
import { KafkaService } from './services/kafka-service'
import { configInit, StatsController } from './controller/Stats'
import { AmqpService } from './services/amqp-service'
import { Publisher } from 'amqplib-plus'
import { Channel } from 'amqplib'
import logger from "./util/logger"

export class Application {
    private kafkaInstance: KafkaService

    public init(config: configInit): void {
        this.startUp(config)
    }

    private async initDatabase(): Promise<void> {
        try {
            await database.connect()
            logger.debug('[DATABASE_CONNECT_SUCCESS]')
        } catch (error) {
            logger.error('[DATABASE_CONNECT_ERROR]')
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

            logger.info('[KAFKA_CONNECT_SUCCESS]')
            
            const amqpService = new AmqpService(logger)
            amqpService.shouldRecreateConnection(true)
            const amqpCon = amqpService.connect()

            amqpCon.then(async (c) => {

                c.on("close", (err) => { logger.warn('[AMQP_CLOSE]', err) })
                c.on("error", (err) => { logger.error('[AMQP_ERROR]', err) })

                const preparePublisher = async (ch: Channel) => {
                    await ch.assertQueue(iniConf.rabbitQueueOutputName, { durable: false })
                    await ch.assertExchange(iniConf.rabbitExchangeName, iniConf.rabbitExchangeType)
                    await ch.bindQueue(iniConf.rabbitQueueOutputName, iniConf.rabbitExchangeName, iniConf.rabbitRoutKeyName)
                    logger.debug('[AMQP_PUBLISHER_SUCCESS]', iniConf.rabbitQueueOutputName)
                }

                const publisher = new Publisher(amqpService, preparePublisher)

                logger.info('[AMQP_CONNECT_SUCCESS]')

                await this.initDatabase()

                const statsConsumer = new StatsController(publisher)
                const topico = iniConf.kafkaTopicName
                const ksumer = await this.kafkaInstance.Ksumer(kClient, topico)

                ksumer.on('message', async (message) => {
                    await statsConsumer.proMsg(message.value.toString(), iniConf)
                })
                ksumer.on('error', (e: Error) => {
                    logger.error('[ON_CONSUMER_KAFKA_ERROR]', e)
                })
                ksumer.once('error', (e: Error) => {
                    logger.error('[ONCE_CONSUMER_KAFKA_ERROR]', e)
                    if (e.name === 'TopicsNotExistError') {
                        const topicsToCreate = [{
                            topic: topico,
                            partitions: 1,
                            replicationFactor: 1
                        }];
                        kClient.createTopics(topicsToCreate, async (err, result) => {
                            if (err) {
                                logger.error(err)
                                throw err
                            }

                            //await database.close()
                            //await this.amqpInstance.close()
                            this.startUp(iniConf)
                        })
                    }
                })
            }).catch(logger.error)
        })
        kClient.on('error', (e: Error) => {
            logger.error('[KAFKA_CONNECT_ERROR]', e)
        })
    }
}