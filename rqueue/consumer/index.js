/*
Summary: Wrapper on rqueue. Exposes consumer functionality for background processing
Author: Nikhil Gurnani (nikhil@grappus.com)
TODO:
*/
'use strict';

const AMQP = require('amqplib/callback_api');
const UTIL = require('util');

module.exports = function (rqConfig, serviceName) {

  function Consumer(exchangeObj, queue, cb) {
    let self = this;
    self.logger = require('../../logging/')(serviceName, 'rqConsumerConnection');
    AMQP.connect(rqConfig.RABBITMQ.CONNECT_STRING, (error, conn) => {
      if (error) {
        self.logger('error', 'Rabbitmq connection failed', { error, uri: rqConfig.RABBITMQ.CONNECT_STRING });
        process.exit(1);
      } else {
        conn.createChannel((error, channel) => {
          if (error) {
            self.logger('error', 'Rabbitmq Channel creation failes', { error, uri: rqConfig.RABBITMQ.CONNECT_STRING });
            conn.close();
            process.exit(1);
          } else {
            channel.prefetch(queue.PREFETCH ? queue.PREFETCH : 1);
            channel.assertExchange(exchangeObj.NAME, exchangeObj.TYPE, exchangeObj.OPTIONS);
            channel.assertQueue(queue.NAME, queue.OPTIONS);
            if (typeof queue.KEY === 'string') channel.bindQueue(queue.NAME, exchangeObj.NAME, queue.KEY);
            else if (UTIL.isArray(queue.KEY)) for (let key of queue.KEY)
              channel.bindQueue(queue.NAME, exchangeObj.NAME, key);
            else throw Error('Invalid queue.KEY');

            channel.consume(queue.NAME, function (msg) {
              let payload = JSON.parse(msg.content);
              self.logger('info', ' [x] new message received', payload);
              cb(payload, function (error) {
                if (error) channel.noAck(msg);
                else channel.ack(msg);
              });
            }, queue.CONSUMEOPTS);
            self.logger('info', 'Rabbitmq consumer channel created', { exchangeObj });
            self.logger('info', ' [*] Waiting for messages in %s. To exit press CTRL+C', { queue, exchangeObj });
          }
        });
      }
    });
  }

  return Consumer;
};
