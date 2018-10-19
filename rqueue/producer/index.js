/*
Summary: Wrapper on rqueue. Exposes producer functionality for background processing
Author: Nikhil Gurnani (nikhil@grappus.com)
TODO:
*/
'use strict';

const AMQP = require('amqplib/callback_api');

module.exports = function (rqConfig, serviceName, logger) {

  function Producer(exchangeObj, routingKey) {
    let self = this;
    self.logger = logger || console.log;
    self.channelCreated = false;
    self.logger('Initializing logger in ' + serviceName);
    AMQP.connect(rqConfig.RABBITMQ.CONNECT_STRING, (error, conn) => {
      if (error) {
        self.logger('Rabbitmq connection failed');
        process.exit(1);
      } else {
        conn.createChannel((error, channel) => {
          if (error) {
            self.logger('Rabbitmq Channel creation');
            conn.close();
            process.exit(1);
          } else {
            self.channel = channel;
            self.channelCreated = true;
            self.exchangeName = exchangeObj.NAME;
            self.severity = routingKey;
            channel.assertExchange(self.exchangeName, exchangeObj.TYPE, exchangeObj.OPTIONS);
            self.logger('Rabbitmq Channel created');
          }
        });
      }
    });
  }

  Producer.prototype.publish = function (payload) {
    let self = this;
    self.channel.publish(self.exchangeName, self.severity, new Buffer.from(JSON.stringify(payload)));
    self.logger('Message Sent: ');
  };

  return Producer;
};
