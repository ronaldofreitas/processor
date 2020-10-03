// Must be at top
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { typeOrmConfig } from './config/type-orm';
import { Connection } from 'amqplib-plus'
import { Channel } from 'amqplib'
import { optionsAmqp } from './config/amqp-config';
import { StatsController } from './controller/StatsController';

(async () => {
    const run = async () => {
        const connPostgres = await createConnection(typeOrmConfig);
        const connection = new Connection(optionsAmqp, console)
        await connection.connect()
    
        const prepareConsumer = async (ch: Channel) => {
            await ch.assertQueue('stats-consumer-pre', { durable: false })
            await ch.prefetch(5)
        }
    
        const statsConsumer = new StatsController(connPostgres, connection, prepareConsumer)
        await statsConsumer.consume('stats-consumer-pre', {})
        //await connPostgres.close();
    }

    try {
        run()
    } catch (error) {
        console.log(error)
    } 
})();
