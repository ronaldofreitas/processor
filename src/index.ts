import { Application } from "./app"
import logger from "./util/logger"

const app = new Application(logger)
const config_init = {
    kafkaTopicName: '1s5e8w',// mesmo valor criado na '.env' do container docker do kafka
    rabbitExchangeName: '',
    thisQueueProcessorName: 'stats_processor',
    rabbitQueueOutputName: 'consumer_stats'
}
app.init(config_init)