import { Connection, createChannelCallback, Publisher } from 'amqplib-plus'

export class AmqpPublisher extends Publisher {
  constructor (conn: Connection, prepareFn: createChannelCallback) {
    super(conn, prepareFn, false, console)
  }
}