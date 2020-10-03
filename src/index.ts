// Must be at top
import 'reflect-metadata';

import { createConnection } from 'typeorm';
import { typeOrmConfig } from './config/type-orm';
import { Connection } from 'amqplib-plus'
import { Channel } from 'amqplib'
//import Stats from './models/Stats';
import { optionsAmqp } from './config/amqp-config';
import { StatsController } from './controller/StatsController';

/*
import Appointment from './models/Appointment';
import Doctor from './models/Doctor';
import Patient from './models/Patient';
*/

(async () => {

    const connPostgres = await createConnection(typeOrmConfig);

    // 1 - cria tabela 'stats', SE NÃO EXISTIR
    // 2 - recebe dados via consumer
    // 3 - pega dados da tabela 'stats', SE EXISTIR
    // 4 - faz os cálculos, as comparações
    // 5 - atualiza a tabela 'stats'
    // 6 - envia dados do 'result' para o producer

    const connection = new Connection(optionsAmqp, console)
    await connection.connect()

    const prepareConsumer = async (ch: Channel) => {
        await ch.assertQueue('stats-consumer-pre', { durable: false })
        await ch.prefetch(5)
    }

    const statsConsumer = new StatsController(connPostgres, connection, prepareConsumer)
    //const statsConsumer = new ConsumerAmqp(connection, prepareConsumer)
    await statsConsumer.consume('stats-consumer-pre', {})
    console.log("Started consuming 'stats-consumer-pre'")

    /*
    const conn = await createConnection(typeOrmConfig);
    console.log('PG connected.');

    //const stats = new Stats()

    // Closing the TypeORM db connection at the end of the app prevents the process from hanging at the end (ex when you
    // use ctrl-c to stop the process in your console, or when Docker sends the signal to terminate the process).
    await conn.close();
    console.log('PG connection closed.');
    */
})();
