/*
Summary: Wrapper on rqueue. Exposes producer functionality for background processing
Author: Nikhil Gurnani (nikhil@grappus.com)
TODO:
*/
'use strict';

const AMQP = require('amqplib/callback_api');

module.exports = function (rqConfig, serviceName) {

  function Producer(exchangeObj, routingKey) {
    let self = this;
    self.logger = require('../../logging/')(serviceName, 'rqConsumerConnection');
    self.channelCreated = false;
    AMQP.connect(rqConfig.RABBITMQ.CONNECT_STRING, (error, conn) => {
      if (error) {
        self.logger('error', 'Rabbitmq connection failed', { error, uri: rqConfig.RABBITMQ.CONNECT_STRING });
        process.exit(1);
      } else {
        conn.createChannel((error, channel) => {
          if (error) {
            self.logger('error', 'Rabbitmq Channel creation', { error, uri: rqConfig.RABBITMQ.CONNECT_STRING });
            conn.close();
            process.exit(1);
          } else {
            self.channel = channel;
            self.channelCreated = true;
            self.exchangeName = exchangeObj.NAME;
            self.severity = routingKey;
            channel.assertExchange(self.exchangeName, exchangeObj.TYPE, exchangeObj.OPTIONS);
            self.logger('info', 'Rabbitmq Channel created', { exchangeObj, routingKey });
          }
        });
      }
    });
  }

  Producer.prototype.publish = function (payload) {
    let self = this;
    self.channel.publish(self.exchangeName, self.severity, new Buffer.from(JSON.stringify(payload)));
    self.logger('info', ' [x] Sent: ', { payload, routingKey: self.severity });
  };

  return Producer;
};
