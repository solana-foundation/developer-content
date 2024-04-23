---
sidebarLabel: Runtime
title: "Overview of the Solana Runtime"
# sidebarSortOrder: 6
---

## Capability of Programs

The runtime only permits the owner program to debit the account or modify its
data. The program then defines additional rules for whether the client can
modify accounts it owns. In the case of the System program, it allows users to
transfer lamports by recognizing transaction signatures. If it sees the client
signed the transaction using the keypair's _private key_, it knows the client
authorized the token transfer.

In other words, the entire set of accounts owned by a given program can be
regarded as a key-value store, where a key is the account address and value is
program-specific arbitrary binary data. A program author can decide how to
manage the program's whole state, possibly as many accounts.

After the runtime executes each of the transaction's instructions, it uses the
account metadata to verify that the access policy was not violated. If a program
violates the policy, the runtime discards all account changes made by all
instructions in the transaction, and marks the transaction as failed.

### Policy

After a program has processed an instruction, the runtime verifies that the
program only performed operations it was permitted to, and that the results
adhere to the runtime policy.

The policy is as follows:

- Only the owner of the account may change owner.
  - And only if the account is writable.
  - And only if the account is not executable.
  - And only if the data is zero-initialized or empty.
- An account not assigned to the program cannot have its balance decrease.
- The balance of read-only and executable accounts may not change.
- Only the owner may change account size and data.
  - And if the account is writable.
  - And if the account is not executable.
- Executable is one-way (false->true) and only the account owner may set it.
- No one can make modifications to the rent_epoch associated with this account.

## Balancing the balances

Before and after each instruction, the sum of all account balances must stay the
same. E.g. if one account's balance is increased, another's must be decreased by
the same amount. Because the runtime can not see changes to accounts which were
not passed to it, all accounts for which the balances were modified must be
passed, even if they are not needed in the called instruction.

## New Features

As Solana evolves, new features or patches may be introduced that changes the
behavior of the cluster and how programs run. Changes in behavior must be
coordinated between the various nodes of the cluster. If nodes do not
coordinate, then these changes can result in a break-down of consensus. Solana
supports a mechanism called runtime features to facilitate the smooth adoption
of changes.

Runtime features are epoch coordinated events where one or more behavior changes
to the cluster will occur. New changes to Solana that will change behavior are
wrapped with feature gates and disabled by default. The Solana tools are then
used to activate a feature, which marks it pending, once marked pending the
feature will be activated at the next epoch.

To determine which features are activated use the
[Solana command-line tools](https://docs.solanalabs.com/cli/install):

```shell
solana feature status
```

If you encounter problems, first ensure that the Solana tools version you are
using match the version returned by `solana cluster-version`. If they do not
match,
[install the correct tool suite](https://docs.solanalabs.com/cli/install).
