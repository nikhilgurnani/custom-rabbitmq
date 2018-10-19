/*
Summary: This is the entry point of rQueue module helper
Author: Nikhil Gurnani (nikhil@grappus.com)
TODO:
*/

/*
To initialize construtor you need rQCluster config like below
let rq_cluster = {
  RABBITMQ: {
      CONNECT_STRING: 'amqp://guest:guest@localhost:5672?heartbeat=60',
      RETRY_INTERVAL: 5000, // milliseconds
  }
}

let consumerConstructor = require('./consumer)(rq_cluster);
let producerConstructor = require('./producer)(rq_cluster);

Every rQueue config must have config like below for each pair
let myConf = {
  QUEUE: {
    NAME: 'q_name',
    PREFETCH: 1, // prefetch count
    OPTIONS: {
      exclusive: false,
      durable: true,
      autoDelete: false
    },
    CONSUMEOPTS: {
      noAck: false
    },
    BINDINGKEY: 'binding.key.*',

    KEY: 'binding.key.*',

    EXCHANGE_OPTS: {
      NAME: 'ex_name',
      TYPE: 'topic',
      OPTIONS: {
        durable: true,
        internal: false,
        autoDelete: false
      }
    }
  }
}

initialize a constructor like below
let myConsumer = new consumerConstrutor(myConf.QUEUE.EXCHANGE_OPTS, myConf.QUEUE, {}, fulfillMentFunction)

fulfillMentFunction is a normal function that have below signature and get called when a new message came
function fulfillMentFunction(error, payload) {...};


initialize a producer like below
let myProducer = new producerConstructor(myConf.QUEUE.EXCHANGE_OPTS, myConf.QUEUE.BINDINGKEY);

to push a message into producer just call below

myProducer.publish(payload, {});
*/

module.exports = {
  consumerConstructor: require('./consumer'),
  producerConstructor: require('./producer'),
};
