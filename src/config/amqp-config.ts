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
*/

const optionsAmqp = {
    host: (<string>process.env.RABBIT_HOST),
    port: parseInt(<string>process.env.RABBIT_PORT),
    user: (<string>process.env.RABBIT_USER),
    pass: (<string>process.env.RABBIT_PASS),
    vhost: (<string>process.env.RABBIT_VHOST),
    heartbeat: parseInt(<string>process.env.HEARTBEAT)
}

export { optionsAmqp }