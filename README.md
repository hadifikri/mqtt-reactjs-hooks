# MQTTJS wrapper with React Hooks

This library is focused in help you to connect, publish and subscribe to a Message Queuing Telemetry Transport (MQTT) in ReactJS with the power of React Hooks.

Rewritten in `javascript` from [mqtt-react-hooks](https://www.npmjs.com/package/mqtt-react-hooks) due to bug for the latest `mqtt` and `react` versions.

## Pre-requisites:

- `React ^17.0.2`
- `mqtt ^4.3.4`
- custom `mqtt_hooks` library

## Hooks available

- `useMqttState()` -> `return {connectionStatus, mqttClient}`
  - `connectionStatus`:
    - `Connecting`
    - `Connected`
    - `Reconnecting`
    - `Offline`
  - `mqttClient` is used to transmit data to the drone via `mqttClient.publish` method.
- `useSubscription(topic:string|arrayOfString|object,options?)` -> `return {mqttClient, topic, message, connectionStatus}`
  - `topic` is `String` topic to subscribe to or an `Array` or `object`
    - `object = { 'topic1' : {qos: 0|1|2}, 'topic2': {qos: 0|1|2} }`
  - `options` is the options `object` to subscribe with, including:
    - `qos` QoS subscription level, `default 0`
    - `nl` No Local MQTT 5.0 flag (If the value is `true`, Application Messages MUST NOT be forwarded to a connection with a `ClientID` equal to the `ClientID` of the publishing connection)
    - `rap` Retain as Published MQTT 5.0 flag (If `true`, Application Messages forwarded using this subscription keep the `RETAIN` flag they were published with. If `false`, Application Messages forwarded using this subscription have the `RETAIN` flag set to 0.)
    - `rh` Retain Handling MQTT 5.0 (This option specifies whether retained messages are sent when the subscription is established.)
    - `properties`: `object`
      - `subscriptionIdentifier`: representing the identifier of the subscription number,
      - `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs object

## Usage

`npm install mqtt-reactjs-hooks`

The `mqtt` client version `4.3.4` is wrapped in `react-hooks` to facilitate the connection as well as data subsription. `React.useContext` is used to provides for the `mqtt` client in order to share a single instance of `mqtt` connection across all components. Thus, the `<Connector>` component must wrap the `root` component.

### Root component i.e. `App`

The only property for the connector is the connection information for mqtt.[Client#connect](https://github.com/mqttjs/MQTT.js#connect)

```js
import React from 'react';

import { Connector } from 'mqtt-reactjs-hooks';
import Status from './Status';

export default function App() {
  return (
    <Connector brokerUrl='ws://test.mosquitto.org:1884'>
      <Status />
    </Connector>
  );
}
```

`brokerUrl` : can be on the following protocols: `mqtt`, `mqtts`, `tcp`, `tls`, `ws`, `wss`, `wxs`, `alis`. The `URL` can also be an object as returned by `URL.parse()`, in that case the two objects are merged, i.e. you can pass a single object with both the `URL` and the connect `options`.

```js
<Connector brokerUrl="ws://test.mosquitto.org" options={
  servers:[{host: 'localhost', port: 1883}], // optional servers settings
  keepAlive:60, // in seconds
  reschedulePings:true,  //reschedule ping messages after sending packets (default true)
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true, // set to false to receive QoS 1 and 2 messages while offline
  reconnectPeriod: 1000 // milliseconds, interval between two reconnections. Disable auto reconnect by setting to 0.
  connectTimeout: 30 * 1000, // milliseconds, time to wait before a CONNACK is received
  username: , //the username required by your broker, if any
  password: , //the password required by your broker, if any
  incomingStore: ,//a Store for the incoming packets
  outgoingStore: , //a Store for the outgoing packets
  queueQoSZero: , //if connection is broken, queue outgoing QoS zero messages (default true)
  autoUseTopicAlias: ,//enabling automatic Topic Alias using functionality
  properties: {//properties MQTT 5.0. object that supports the following properties:
    sessionExpiryInterval: ,//representing the Session Expiry Interval in seconds number,
    receiveMaximum: ,//representing the Receive Maximum value number,
    maximumPacketSize: ,//representing the Maximum Packet Size the Client is willing to accept number,
    topicAliasMaximum: , //representing the Topic Alias Maximum value indicates the highest value that the Client will accept as a Topic Alias sent by the Server number,
    requestResponseInformation: ,//The Client uses this value to request the Server to return Response Information in the CONNACK boolean,
    requestProblemInformation: ,//The Client uses this value to indicate whether the Reason String or User Properties are sent in the case of failures boolean,
    userProperties: ,//The User Property is allowed to appear multiple times to represent multiple name, value pairs object},
    authenticationMethod: ,//the name of the authentication method used for extended authentication string,
    authenticationData: ,//Binary Data containing authentication data binary
  },
  authPacket: ,//settings for auth packet object
  will: {//a message that will sent by the broker automatically when the client disconnect badly. The format is:
    topic: ,//the topic to publish
    payload: ,//the message to publish
    qos: ,//the QoS
    retain: ,//the retain flag
    properties: ,//properties of will by MQTT 5.0:
    willDelayInterval: ,//representing the Will Delay Interval in seconds number,
    payloadFormatIndicator: ,//Will Message is UTF-8 Encoded Character Data or not boolean,
    messageExpiryInterval: ,//value is the lifetime of the Will Message in seconds and is sent as the Publication Expiry Interval when the Server publishes the Will Message number,
    contentType: ,//describing the content of the Will Message string,
    responseTopic: ,//String which is used as the Topic Name for a response message string,
    correlationData: , //The Correlation Data is used by the sender of the Request Message to identify which request the Response Message is for when it is received binary,
    userProperties: , //The User Property is allowed to appear multiple times to represent multiple name, value pairs object
  }
  transformWsUrl : optional (url, options, client) => url // function For ws/wss protocols only. Can be used to implement signing urls which upon reconnect can have become expired.
  resubscribe : true,//if connection is broken and reconnects, subscribed topics are automatically subscribed again (default true)
  messageIdProvider: , //custom messageId provider. when new UniqueMessageIdProvider() is set, then non conflict messageId is provided.
}>
{child component}
</Connector>
```

### useMqttState()

Mainly would be used to monitor the connection status or publishing the data.

#### Status

```javascript
import React from 'react';

import { useMqttState } from 'mqtt-reactjs-hooks';

export default function Status() {
  /*
   * Status list
   * - Offline
   * - Connected
   * - Reconnecting
   * - Closed
   * - Error: printed in console too
   */
  const { connectionStatus } = useMqttState();

  return <h1>{`Status: ${connectionStatus}`}</h1>;
}
```

#### Publishing

MQTT Client is passed on `useMqttState` and can be used to publish messages via `mqtt`.[Client#publish](https://github.com/mqttjs/MQTT.js#publish) and don't need `Subscribe`

```javascript
import React from 'react';
import { useMqttState } from 'mqtt-react-hooks';

export default function Status() {
  const { mqttClient } = useMqttState();

  function handleClick(message) {
    return mqttClient.publish('ping/esp32', message);
  }

  return (
    <button type='button' onClick={() => handleClick('start')}>
      Start
    </button>
  );
}
```

### useSubscription()

Subscribing and receiving messages

```javascript
import React from 'react';

import { useSubscription } from 'mqtt-reactjs-hooks';

export default function Status() {
  /* Message structure:
   *  topic: string
   *  message: string
   */
  const { message } = useSubscription(['esp32/home/sensors']);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{`topic:${message.topic} - message: ${message.message}`}</span>
      </div>
    </>
  );
}
```
