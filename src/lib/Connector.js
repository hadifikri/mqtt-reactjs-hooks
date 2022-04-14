import { connect } from 'mqtt/dist/mqtt';
import React from 'react';
import { MqttContext } from './MqttContext';

export default function Connector({ children, brokerUrl, options = {} }) {
  const mountedRef = React.useRef(true);
  const connectedRef = React.useRef(false);

  const [connectionStatus, setStatus] = React.useState('Offline');
  const [mqttClient, setMqttClient] = React.useState(null);

  const mqttConnect = React.useCallback(async () => {
    // console.log(`--->connecting to ${brokerUrl}`);
    setStatus('Connecting');
    const client = connect(brokerUrl, options);
    client.on('connect', () => {
      if (connectedRef.current === false) {
        connectedRef.current = true;
        setMqttClient(client);
        setStatus('Connected');
      }
    });
    client.on('reconnect', () => {
      // console.log('--->reconnect');
      if (mountedRef.current) {
        setStatus('Reconnecting');
      }
    });
    client.on('error', (err) => {
      // console.log('--->error');
      if (mountedRef.current) {
        console.log(`Connection error: ${err}`);
        setStatus(err.message);
      }
    });
    client.on('offline', () => {
      // console.log('--->offline');
      if (mountedRef.current) {
        setStatus('Offline');
      }
    });
    client.on('end', () => {
      // console.log('--->end');
      connectedRef.current = false;
      if (mountedRef.current) {
        setStatus('Offline');
      }
    });
  }, [brokerUrl, options]);

  React.useEffect(() => {
    if (!mqttClient) {
      mqttConnect();
    }
    return () => {
      mountedRef.current = false;
      mqttClient?.end(true);
    };
  }, [mqttClient, mqttConnect]);

  // console.log('--->mqtt connection:', connectionStatus);

  return <MqttContext.Provider value={{ connectionStatus, mqttClient }}>{children}</MqttContext.Provider>;
}
