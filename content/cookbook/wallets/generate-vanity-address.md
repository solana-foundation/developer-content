---
title: How to Generate a Vanity Address
sidebarSortOrder: 6
description:
  "Creating custom addresses on Solana is a fun way to make your public key
  unique. Learn how to create vanity addresses on Solana."
---

Vanity publickeys, or custom addresses, are keys that have start with specific
characters.

For example, a person may want a publickey to start with `elv1s`, or maybe even
`cook`. These can help other people remember who the key belongs to, making the
key more easily identifiable.

**Note**: The more characters in your vanity address, the longer it will take.

You can generate a vanity address using the
[Solana CLI](/docs/intro/installation.md):

```bash
solana-keygen grind --starts-with e1v1s:1
```
