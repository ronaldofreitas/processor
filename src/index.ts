import { Connection } from 'amqplib-plus'
import { Channel } from 'amqplib'
//import { optionsAmqp } from './config/amqp-config';
import { StatsConsumer } from './consumer/StatsController';
import * as database from './database';

(async () => {
    try {
        await database.connect();

        const connection = new Connection({ connectionString: 'amqps://feadhfit:XMb8d1vGS5_jhrPjm4jlRmW7Te8CnYwr@crane.rmq.cloudamqp.com/feadhfit' }, console)
        //const connection = new Connection(optionsAmqp, console)
        await connection.connect()
    
        const prepareConsumer = async (ch: Channel) => {
            await ch.assertQueue('stats-consumer-pre', { durable: false })
            await ch.prefetch(5)
        }
    
        const statsConsumer = new StatsConsumer(connection, prepareConsumer)
        //const statsConsumer = new StatsConsumer(dbConn, connection, prepareConsumer)
        await statsConsumer.consume('stats-consumer-pre', {})
    } catch (error) {
        console.log(error)
    } 
})();
