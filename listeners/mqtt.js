/*
Copyright (c) 2013, Intel Corporation

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Intel Corporation nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var mqtt = require('mqtt');

exports.init = function(conf, logger, onMessage) {

  var mqttServerPort = conf.mqtt_port_listen || 1883;
  var mqttServer = mqtt.createServer(function(client) {

    client.on('connect', function(packet) {
      client.connack({returnCode: 0});
      client.id = packet.clientId;
      logger.debug('MQTT Client connected: ', packet.clientId);
    });

    client.on('publish', function(packet) {
      logger.debug('MQTT Topic: %s Payload: %s', packet.topic, packet.payload);
      try {
        onMessage(JSON.parse(packet.payload));
      } catch (ex) {
        logger.error('MQTT Error on message: %s', ex);
      }
  });

    client.on('pingreq', function() {
      client.pingresp();
    });

    client.on('disconnect', function() {
      client.stream.end();
    });

    client.on('error', function(err) {
      //client.stream.end();
      logger.error('MQTT Error: ', err);
    });

  }).listen(mqttServerPort);

  logger.info("MQTT listener started on port: ", mqttServerPort);

  return mqttServer;

};


