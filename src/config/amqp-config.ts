import * as dotenv from 'dotenv'
dotenv.config();

/*
const options = {
    host: "localhost",
    port: 5672,
    user: "guest",
    pass: "guest",
    vhost: "/",
    heartbeat: 60,
};

const optionsAmqpDev = {
    host: (<string>process.env.RABBIT_HOST),
    port: parseInt(<string>process.env.RABBIT_PORT),
    user: (<string>process.env.RABBIT_USER),
    pass: (<string>process.env.RABBIT_PASS),
    vhost: (<string>process.env.RABBIT_VHOST),
    heartbeat: parseInt(<string>process.env.HEARTBEAT)
}

*/

const optionsAmqp = {
    connectionString: 'amqps://feadhfit:XMb8d1vGS5_jhrPjm4jlRmW7Te8CnYwr@crane.rmq.cloudamqp.com/feadhfit'
}


export { optionsAmqp }