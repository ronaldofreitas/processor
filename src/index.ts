
/*
import { Channel } from "amqplib";

const amqpPlus = require("amqplib-plus");

const options = {
	host: "localhost",
	port: 5672,
	user: "guest",
	pass: "guest",
	vhost: "/",
	heartbeat: 60,
};

const connection = new amqpPlus.Connection(options);

async function run() {
	await connection.connect();

	// Method to be called before instance is created and after every connection auto-reconnect
	const preparePublisher = async (ch: Channel) => {
		await ch.assertQueue("my-queue", { durable: false });
		await ch.assertExchange("exchange-malandra", "direct");
		await ch.bindQueue("my-queue", "exchange-malandra", "routKey");
		console.log("Publisher ready");
	};

	// Creates the instance
	const publisher = new amqpPlus.Publisher(connection, preparePublisher);

	// Send messages to message broker
	await publisher.sendToQueue("my-queue", Buffer.from("message content"), {});
	await publisher.publish("exchange-malandra", "routKey", Buffer.from("another content"), {});
	console.log("Two messages sent.");
}

run();
*/


import { Application } from "./app"
import logger from "./util/logger"

const app = new Application(logger)
const config_init = {
    kafkaTopicName: '1s5e8w',// mesmo valor criado na '.env' do container docker do kafka
    rabbitExchangeName: 'exchange-malandra',
    rabbitQueueOutputName: 'my-queue',
    rabbitRoutKeyName: 'routKey'
}
app.init(config_init)
