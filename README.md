## LiveKit NodeJS Server  

A simple livekit room management, token issuance server

### Start

```bash
mkdir cert
touch config.js
node server.js
```

### Config.js

```js
export default {
    appKey: "", // LiveKit Api Key
    appSecret: "", // Api Secret
    livekitHost: "", // Your LiveKit Host
    port: :Number, // default 3000
}
```

### Require

The minimum required Nodejs 17.5
