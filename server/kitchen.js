#!/usr/bin/env node

var amqp = require("amqplib/callback_api")

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1
    }

    const exchange = "restaurant_exchange"
    channel.assertExchange(exchange, "direct", {
      durable: true,
    })

    const queues = ["desserts", "thai", "italian", "drinks"]

    queues.forEach((queue_type) => {
      channel.assertQueue(
        queue_type,
        {
          durable: true,
        },
        function (error2, q) {
          if (error2) {
            throw error2
          }
          channel.bindQueue(q.queue, exchange, queue_type)
        }
      )
    })

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C")
    channel.prefetch(1)

    queues.forEach((queue_type) => {
      channel.consume(
        queue_type,
        function (msg) {
          var secs = msg.content.toString().split(".").length - 1
          console.log(`[x] Received at queue name: ${queue_type}`)
          console.log(JSON.parse(msg.content))

          setTimeout(function () {
            console.log(`[x] Queue name: ${queue_type} Done`)
            channel.ack(msg)
          }, secs * 1000)
        },
        {
          noAck: false,
        }
      )
    })
  })
})
