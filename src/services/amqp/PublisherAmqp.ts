import { Connection, createChannelCallback, Publisher } from 'amqplib-plus'

export class PublisherAmqp extends Publisher {
  constructor (conn: Connection, prepareFn: createChannelCallback) {
    super(conn, prepareFn, false, console)
  }
}