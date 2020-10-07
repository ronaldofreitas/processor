import { Connection } from 'amqplib-plus'
import { Logger } from 'winston'

export class AmqpService extends Connection {
    constructor(logger: Logger) {
        //super({ connectionString: 'amqp://localhost' }, logger)
        super({ connectionString: 'amqps://feadhfit:XMb8d1vGS5_jhrPjm4jlRmW7Te8CnYwr@crane.rmq.cloudamqp.com/feadhfit' }, logger)
    }

    public async conn(): Promise<Connection> {
        const c = this.connect()
        return c.then(co => {return co}).catch(e => {return e})
    }
}