import { Connection, Consumer, createChannelCallback } from 'amqplib-plus'
import { Channel, Message } from 'amqplib'

export class ConsumerAmqp extends Consumer {
  constructor (conn: Connection, prepareFn: createChannelCallback) {
    super(conn, prepareFn, false, console)
  }

  processMessage (msg: Message, channel: Channel) {
    // console.log('Message headers:', JSON.stringify(msg.properties.headers))
    // console.log('Message body:', msg.content.toString(), '\n')
    console.log('body:', msg.content.toString(), '\n')

    // Your own condition to decide whether to ack/nack/reject
    if (msg.content.toString().length > 10) {
      // return channel.nack(msg)
    }

    channel.ack(msg)
  }
}
