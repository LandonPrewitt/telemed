#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = (args.length > 0) ? args[0] : 'anonymous.info';

    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
	ch.consume(q, function(msg) {
	  console.log(" [x] Received %s", msg.content.toString());
	}, {noAck: true});
  });
});