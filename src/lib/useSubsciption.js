import { useContext, useEffect, useCallback, useState } from 'react';
import { matches } from 'mqtt-pattern';
import { MqttContext } from './MqttContext';

export default function useSubscription(topic, options) {
  const { connectionStatus, mqttClient } = useContext(MqttContext);
  const [message, setMessage] = useState(undefined);

  const callback = useCallback(
    (receivedTopic, receivedMessage) => {
      if ([topic].flat().some((rTopic) => matches(rTopic, receivedTopic))) {
        setMessage({
          topic: receivedTopic,
          message: receivedMessage.toString(),
        });
      }
    },
    [topic]
  );

  const subscribe = useCallback(async () => {
    if (!mqttClient) return;

    mqttClient.subscribe(topic, options, (err, _) => {
      if (!err) {
        mqttClient.on('message', callback);
      }
    });
  }, [mqttClient, options, topic, callback]);

  useEffect(() => {
    if (mqttClient != null)
      if (mqttClient.connected) {
        subscribe();
      }
    return () => {
      mqttClient?.removeListener('message', callback);
    };
  }, [callback, mqttClient, subscribe]);

  return {
    mqttClient,
    topic,
    message,
    connectionStatus,
  };
}
