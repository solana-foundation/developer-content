---
title: Subscribing to Events
sidebarSortOrder: 4
description: Learn how to subscribe to events in the Solana network.
---

Websockets provide a pub/sub interface where you can listen for certain events.
Instead of pinging a typical HTTP endpoint at an interval to get frequent
updates, you can instead receive those updates only when they happen.

Solana's web3
[`Connection`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Connection.html)
under the hood generates a websocket endpoint and registers a websocket client
when you create a new `Connection` instance (see source code
[here](https://github.com/solana-labs/solana-web3.js/blob/45923ca00e4cc1ed079d8e55ecbee83e5b4dc174/src/connection.ts#L2100)).

The `Connection` class exposes pub/sub methods - they all start with `on`, like
event emitters. When you call these listener methods, it registers a new
subscription to the websocket client of that `Connection` instance. The example
pub/sub method we use below is
[`onAccountChange`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Connection.html#onAccountChange).
The callback will provide the updated state data through arguments (see
[`AccountChangeCallback`](https://solana-labs.github.io/solana-web3.js/v1.x/types/AccountChangeCallback.html)
as an example).

```typescript filename="subscribe-to-events.ts"
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

(async () => {
  // Establish new connect to devnet - websocket client connected to devnet will also be registered here
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Create a test wallet to listen to
  const wallet = Keypair.generate();

  // Register a callback to listen to the wallet (ws subscription)
  connection.onAccountChange(
    wallet.publicKey,
    (updatedAccountInfo, context) =>
      console.log("Updated account info: ", updatedAccountInfo),
    "confirmed",
  );
})();
```
