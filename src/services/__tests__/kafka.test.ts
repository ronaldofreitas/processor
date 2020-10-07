import { KafkaService } from "../kafka-service";
//import KafkaService from "../kafka-service";

const kafkaInstance = new KafkaService()


/*
testar
    - formato da mensagem
    - enviar mensagem
    - receber mensagem
*/

jest.mock('kafka-node')

jest.useFakeTimers();

describe("kafka service", () => {
    
    /*
    it('Some long test', () => {
        // long stuff, more 10 min
    }, 20 * 60 * 1000);
    */

    /*
    // criar tópico se não existe
    it("should create a topic if not exists",  async (done) => {
        const kClient =  kafkaInstance.initClient()
        ;(await kClient).on('ready', () => {
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
            done();
            expect(1).toBe(2)
        })
    }, 10000);
    */

    
    it('the data is peanut butter', () => {
        return kafkaInstance.initClient().then(cli => {
            //expect(cli).toBe('peanut butter');
            expect(cli).toBeCalled();
        });
    });
    

    /*
    
    it("should create a topic if not exists", async (done) => {
        return await kafkaInstance.initClient().then(cli => {
            const topic = "dasdad";
            const consumer = kafkaInstance.Ksumer(cli, topic);
            return consumer.then((c) => {
                console.log(c)
                const createTopic = kafkaInstance.createTopic(c, [{topic}])
                return createTopic.then((d) => {
                    console.log('>>>>>>>>>>', d)
                    expect(1).toBe(2);
                    done();
                })
            })
        });

    });
    */

    

    /*
    it("should send message to kafka", async () => {
        const expectedOffset = kafkaInstance.latesOffsetFromTopic(await kClient, [topic]);
        const payloads = [{ topic, messages: 'hi', partition: 0 }];
        const producer = kafkaInstance.ksender(await kClient)
        ;(await producer).send(payloads, (err, data) => {});
        
        const currentOffset = kafkaInstance.latesOffsetFromTopic(await kClient, [topic]);
        const sentMessagesCount = currentOffset - expectedOffset;
        expect(sentMessagesCount).toBe(1);
    });
    */
});

/*
import * as kafka from "kafka-node";
import kafkaProducer from "../src/KafkaProducer";

const kafkaHost = "localhost:8080";

const getCurrentKafkaOffset = (topic) => {
    const client = new kafka.KafkaClient({kafkaHost});
    const offset = new kafka.Offset(client);
    return new Promise((resolve, reject) => offset.fetchLatestOffsets([topic], (error, data) => {
        error? reject(error) : resolve(data[topic]["0"]);
    }));
};

describe("kafka producer", () => {
    it("should send message to kafka", async () => {
        const topic = "some topic";
        const someMessage = "some message";
        const expectedOffset = await getCurrentKafkaOffset(topic);

        kafkaProducer.sendMessage(topic, someMessage);

        const currentOffset = await getCurrentKafkaOffset(topic);
        const sentMessagesCount = currentOffset - expectedOffset;
        expect(sentMessagesCount).toBe(1);
    });
});
*/