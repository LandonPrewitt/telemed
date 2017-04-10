#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
  	var args = process.argv.slice(2);
    var q = (args.length > 0) ? args[0] : 'anonymous.info';

    var data = args.slice(1).join(' ') || 'Hello World!';
    ch.assertQueue(q, {durable: false});
    // Note: on Node 6 Buffer.from(msg) should be used
    ch.sendToQueue(q, new Buffer(data));
    console.log(" [x] Sent %s",data);
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
