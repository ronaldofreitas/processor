import { KafkaClient, Consumer } from 'kafka-node';

export class KafkaService {

    public async initClient(): Promise<KafkaClient> {
        try {
            return new KafkaClient({kafkaHost: '172.17.0.3:9092'});
        } catch (error) {
            return error
        }
    }

    public async Ksumer(
        client: KafkaClient, topic: string, partition: number, autoCommit: boolean
    ): Promise<Consumer> {
        return new Consumer(client, [ { topic, partition } ], { autoCommit })
    }

    // kSender
}