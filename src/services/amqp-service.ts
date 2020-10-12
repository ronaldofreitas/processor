import { Connection } from 'amqplib-plus'
import { optionsAmqp } from '../config/amqp-config'
import { Logger } from 'winston'

export class AmqpService extends Connection {
    constructor(logger: Logger) {
        //super({ connectionString: 'amqp://localhost:5672/' }, logger)
        super(optionsAmqp, logger)
    }

    /*
    public async conn(): Promise<Connection> {
        const c = this.connect()
        return c.then(co => {return co}).catch(e => {return e})
    }
    */
}