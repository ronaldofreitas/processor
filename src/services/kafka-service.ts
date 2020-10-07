import { KafkaClient, Consumer, Producer, Offset, OffsetRequest, Topic } from 'kafka-node';

export class KafkaService {

    public async initClient(): Promise<KafkaClient> {
        const operation = {
            retries: 2,
            //factor: 1,
            minTimeout: 1 * 1,
            maxTimeout: 1 * 1,
            randomize: true,
        };
        return new KafkaClient({
            kafkaHost: '172.17.0.3:9092', 
            autoConnect: true, 
            connectRetryOptions: operation
        });
    }
    /*
    public async initClient(): Promise<KafkaClient> {
        const operation = {
            retries: 2,
            //factor: 1,
            minTimeout: 1 * 1,
            maxTimeout: 1 * 1,
            randomize: true,
        };
        return new KafkaClient({
            kafkaHost: '172.17.0.3:9092', 
            autoConnect: true, 
            connectRetryOptions: operation
        });
    }

    */
    public async Ksumer(
        client: KafkaClient, topic: string
    ): Promise<Consumer> {
        return new Consumer(client, [ { topic, partition: 0 } ], { autoCommit: true })
    }

    public async createTopic(
        ksumer: Consumer, topic: Topic[]
    ): Promise<void> {
        ksumer.addTopics(topic, (err, data) => {
            if (err) return err
            return data
        })
    }

    public async ksender(
        client: KafkaClient
    ): Promise<Producer> {
        return new Producer(client)
    }

    public async offsetFromTopic(
        client: KafkaClient, payloads: OffsetRequest[]
    ): Promise<void> {
        const offset = new Offset(client)
        offset.fetch(payloads, (err, data) => {
            if (err) return err
            return data
        })
    }

    public async latesOffsetFromTopic(
        client: KafkaClient, topics: string[]
    ): Promise<void> {
        const offset = new Offset(client)
        offset.fetchLatestOffsets(topics, (err, data) => {
            if (err) return err
            return data
        })
    }
}

//export default new KafkaService().initClient();