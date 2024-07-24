---
title: How to get a token account's balance
sidebarSortOrder: 5
description:
  "Learn how to quickly retrieve a Solana token account's balance with a single
  call. Includes code examples in both TypeScript and Rust."
---

The token account has the token balance, which can be retrieved with a single
call

```typescript filename="get-token-balance.ts"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const tokenAccount = new PublicKey(
    "FWZedVtyKQtP4CXhT7XDnLidRADrJknmZGA2qNjpTPg8",
  );

  let tokenAmount = await connection.getTokenAccountBalance(tokenAccount);
  console.log(`amount: ${tokenAmount.value.amount}`);
  console.log(`decimals: ${tokenAmount.value.decimals}`);
})();
```

```rust filename="get-token-balance.rs"
use solana_client::rpc_client::RpcClient;
use solana_program::pubkey::Pubkey;
use solana_sdk::commitment_config::CommitmentConfig;
use std::str::FromStr;

fn main() {
    let rpc_url = String::from("https://api.devnet.solana.com");
    let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());

    let token_account = Pubkey::from_str("FWZedVtyKQtP4CXhT7XDnLidRADrJknmZGA2qNjpTPg8").unwrap();
    let balance = connection
        .get_token_account_balance(&token_account)
        .unwrap();

    println!("amount: {}, decimals: {}", balance.amount, balance.decimals);
}
```

<Callout type="info">
  A token account can only hold one kind of mint. When you specify a token account, you also specific a mint too.
</Callout>
