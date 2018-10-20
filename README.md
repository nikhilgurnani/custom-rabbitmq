# custom-rabbitmq
This NPM module provides a plug and play functionality for RabbitMQ Producers and Consumers.

## Installation
Run `npm -i custom-rabbitmq` in your command line.

### To initialize construtor you need rQCluster config like below
```javascript
let rq_cluster = {
  RABBITMQ: {
      CONNECT_STRING: 'amqp://guest:guest@localhost:5672?heartbeat=60', //Your RabbitMQ Server instead of localhost
      RETRY_INTERVAL: 5000, // Retry time in milliseconds
  }
}
```

### Every rabbitmq queue must have config for each pair of producer and consumer. You can set the different parameters of the configuration according to your needs. It would somewhat look like:

```javascript
let myConf = {
  QUEUE: {
    NAME: 'q_name', // Queue name
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
      NAME: 'ex_name', // Name of exchange
      TYPE: 'topic',
      OPTIONS: {
        durable: true,
        internal: false,
        autoDelete: false
      }
    }
  }
}
```
### To construct producer or consumer with the rabbitmq configuration, simply use the below code:

```javascript
let consumerConstructor = require('./rqueue/consumer')(rq_cluster);
let producerConstructor = require('./rqueue/producer')(rq_cluster);
```
### Initialize a constructor like below

```javascript
let myConsumer = new consumerConstrutor(myConf.QUEUE.EXCHANGE_OPTS, myConf.QUEUE, {}, fulfillMentFunction)
```
Here, the fulfilmentFunction is a callback function with the signature `function fulfillMentFunction(error, payload)`. In simpler terms, this is the function that will read the message from the queue and be executed for each message in the queue. So for example,
```javascript
function fulfilmentFunction(error, payload){
    console.log('Hi, new message ', payload);
    /***
     * Do
     * Some
     * Stuff
     * */
};
```
### Initialize a producer like below

```javascript
let myProducer = new producerConstructor(myConf.QUEUE.EXCHANGE_OPTS, myConf.QUEUE.BINDINGKEY);
```
Simply push a message into the queue, by using the following syntax
```javascript
myProducer.publish({
    'key': 'value',
    'key1': 'value1',
    /***
     * More keys here
     * */
});
```
