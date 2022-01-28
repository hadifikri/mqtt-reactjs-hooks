import { useContext } from 'react';
import { MqttContext } from './MqttContext';

export default function useMqttState() {
  const { connectionStatus, mqttClient } = useContext(MqttContext);
  return {
    connectionStatus,
    mqttClient,
  };
}
