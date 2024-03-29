import { Application } from "./app"

const app = new Application()
const config_init = {
    kafkaHost: '172.17.0.3:9092',
    kafkaTopicName: '1s5e8w',// mesmo valor criado na '.env' do container docker do kafka
    rabbitExchangeName: 'exchange1',
    rabbitExchangeType: 'direct',
    rabbitQueueOutputName: 'pre-stats',
    rabbitQueueReplyTo: 'notify',
    rabbitRoutKeyName: 'routKey',
}
app.init(config_init)
