// Config that is common to more than one part of the app.
import * as dotenv from 'dotenv'
import Stats from 'src/models/Stats';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
dotenv.config();

const typeOrmConfig: PostgresConnectionOptions = {
    type: "postgres",
    host: (<string>process.env.POSTGRES_HOST),
    port: parseInt(<string>process.env.POSTGRES_PORT),
    username: (<string>process.env.POSTGRES_USERNAME),
    password: (<string>process.env.POSTGRES_PASSWORD),
    database: (<string>process.env.POSTGRES_DATABASE),
    synchronize: true,
    logging: false,
    entities: [
        Stats,
    ]
};

export { typeOrmConfig };
