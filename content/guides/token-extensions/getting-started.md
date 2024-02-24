---
featured: true
featuredPriority: 1
date: Jan 19, 2024
difficulty: beginner
seoTitle: "Getting Started with Token Extensions"
title: "Getting Started with Token Extensions"
description:
  "With the new token extensions, you can create custom logic for your tokens.
  In this guide we will go over everything you need to know about token
  extensions and what you need to get started building today"
keywords:
  - token 2022
  - token extensions
  - token program
tags:
  - token 2022
  - token extensions
---

Token extensions are the next generation of the Solana Program Library standard.
Token extensions introduce a new set of ways to extend the normal token
functionality. The original Token program brought the basic capabilities of
minting, transferring and freezing tokens. The Token Extensions program includes
the same features, but come with additional features such as confidential
transfers, custom transfer logic, extended metadata, and much more.

The [Token Extensions program](https://spl.solana.com/token-2022) has the
programID `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` and is a superset of the
original functionality provided by the
[Token Program](https://spl.solana.com/token) at
`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`.

## How do I create a token with token extensions?

To get started creating tokens with token extensions, you can use the
[Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools) to
create tokens with a CLI. Based on the extension you want to create, your
command flags may be different. Below are the flags to add to create tokens with
each type of extension.

| Extension                                                                                          | CLI Flag                                  |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [Mint Close Authority](https://solana.com/developers/guides/token-extensions/mint-close-authority) | --enable-close                            |
| [Transfer Fees](https://solana.com/developers/guides/token-extensions/transfer-fee)                | --transfer-fee \<basis points> \<max fee> |
| [Non-Transferable](https://solana.com/developers/guides/token-extensions/non-transferable)         | --enable-non-transferable                 |
| [Interest-Bearing](https://solana.com/developers/guides/token-extensions/interest-bearing-tokens)  | --interest-rate \<rate>                   |
| [Permanent Delegate](https://solana.com/developers/guides/token-extensions/permanent-delegate)     | --enable-permanent-delegate               |
| Transfer Hook                                                                                      | --transfer-hook \<programID>              |
| [Metadata](https://solana.com/developers/guides/token-extensions/metadata-pointer)                 | --enable-metadata                         |
| [Metadata Pointer](https://solana.com/developers/guides/token-extensions/metadata-pointer)         | --metadata-address \<accountId>           |
| Confidential Transfers                                                                             | --enable-confidential-transfers auto      |

You enable some extensions on a token account instead of the mint, which you can
also find the required flags for each below.

| Extension                                                                                            | CLI Flag                         |
| ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| [Immutable Owner](https://solana.com/developers/guides/token-extensions/immutable-owner)             | Included by default              |
| [Required Memo on Transfer](https://solana.com/developers/guides/token-extensions/required-memo)     | enable-required-transfer-memos   |
| [CPI Guard](https://spl.solana.com/token-2022/extensions#cpi-guard)                                  | enable-cpi-guard                 |
| [Default Account State](https://solana.com/developers/guides/token-extensions/default-account-state) | --default-account-state \<state> |

Now that you know what extensions are available, you can create your new token
with token extensions with the following command:

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token <extension flags>
```

With token extensions, you can mix and match based on what you need for your
project. For example, if you wanted a token with transfer fees and a custom
metadata, you would just use the following command to combine the extensions:

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token --interest-rate 5 --enable-metadata
```

<Callout>
While you can mix and match extensions, most extensions cannot be added
after the token mint is created. Including non-transferrable, the various "pointer" extensions, and several others.
</Callout>

## What extensions are compatible with each other?

You can combine multiple extensions together, however some extensions would
either not work or not make sense to combine. For example, you would not want to
add transfer hooks alongside the non-transferable token extension because it
would not add anything to the token and only cost more to create.

The following extension combinations either do not work together, or will not
make sense to combine:

- Non-transferable + (transfer hooks, transfer fees, confidential transfer)
- Confidential transfer + fees (until 1.18)
- Confidential transfer + transfer hooks (these transfers can only see source /
  destination accounts, therefore cannot act on the amount transferred)

Other than these, you have the option to customize with any combination of token
extensions that suit your project’s needs.

## How do I add custom logic to my tokens with token extensions?

Token extensions enable you to create custom logic with your tokens while
retaining full composability with dApps, wallets, and programs. The two
extensions that can enable this are the Transfer Hook and Metadata extensions.

### Transfer Hooks

Transfer hooks are a powerful new extension that give token issuers greater
ability to dictate how users and tokens interact. Instead of a normal transfer,
any developer can insert custom logic into a program to be used with the
transfer hook extension. With transfer hooks you can enable capabilities such as
enforced on-chain royalties, enabling more elaborate token interactions.

It is important to note that while transfer hooks give the capability to insert
custom logic within a transfer, all accounts from the initial transfer are
converted to read-only accounts. This means that the signer privileges of the
sender do not extend to the Transfer Hook program. This is to avoid potential
unexpected logic executing on someone’s wallet who interacts with a token with
transfer hooks, protecting the users.

You can
[start building with transfer hooks today](https://github.com/solana-foundation/developer-content/pull/43/files).

### Metadata

The Metadata extension gives token issuers the ability to push any key value
pair on-chain with customizable fields, all within the same account. This
enables projects such as games to have their custom metadata potentially within
each token, creating a wider variety of possibilities of what games can do with
their in-game tokens and items.

This custom on-chain metadata also opens up the door for new standards to be
created, giving opportunity to the developer community to come together to
create new ways to use metadata onchain, all bundled together under token
extensions.

You can
[start building with the metadata extension today](https://solana.com/developers/guides/token-extensions/metadata-pointer).

## How do I migrate tokens from one standard to another?

While token extensions are a new standard for tokens, it is not a requirement
that anyone migrate from one standard to another. There are reasons why you may
want to stick with the original Token standard.

If you only need a transfer and freeze functionality and none of the additional
features of token extensions, the Token program standard will suit your project
just fine. However if you want the ability to add more advanced features, token
extensions can help.

There is no way to automatically convert your tokens across standards today.
[A migration path](https://spl.solana.com/token-upgrade) does exist between the
token standards, but it comes with some complications:

- All tokens of the previous standard must be burned
- The migration will be user opt-in only

The general recommendation is that if you want token extension capabilities for
your token, start with creating your token with that standard.

## What is the instruction layout for Token extensions?

Token extensions supports the exact same instruction layouts as Token, byte for
byte. For example, if you want to transfer 100 tokens on a mint with 2 decimals,
you create a TransferChecked instruction, with this byte-represented data:

```
[12, 100, 0, 0, 0, 0, 0, 0, 0, 2]
 ^^ TransferChecked enum
     ^^^^^^^^^^^^^^^^^^^^^^^^ 100, as a little-endian 64-bit unsigned integer
                               ^ 2, as a byte
```

This format means the exact same thing to both Token and Token extensions. If
you want to target one program over another, you just need to change the
`program_id` in the instruction.

All new instructions in the Token extensions program start where the original
Token program stops. The original Token program has 25 unique instructions, with
indices 0 through 24. The token extensions program supports all of these
instructions, and then adds new functionality at index 25.

## What is the layout of Mints and Accounts?

For structure layouts, the same idea mostly applies. An `Account` has the same
exact representation between Token and Token extensions for the first `165`
bytes, and a `Mint` has the same representation for the first `82` bytes.

## Where is the source code for Token extensions?

The Token extensions program's source is available on
[GitHub](https://github.com/solana-labs/solana-program-library/tree/master/token/program-2022).

For information about the types and instructions, the Rust docs are available at
[docs.rs](https://docs.rs/spl-token-2022/latest/spl_token_2022/).

## Has the token extensions program been audited?

The token extensions program has been audited multiple times. The complete
updated list of audits performed can be found on in the program's
[Security Audits](https://spl.solana.com/token-2022#security-audits)
documentation.

Here are the completed audits as of 13 December 2023:

- Halborn
  - Review commit hash
    [`c3137a`](https://github.com/solana-labs/solana-program-library/tree/c3137af9dfa2cc0873cc84c4418dea88ac542965/token/program-2022)
  - Final report
    https://github.com/solana-labs/security-audits/blob/master/spl/HalbornToken2022Audit-2022-07-27.pdf
- Zellic
  - Review commit hash
    [`54695b`](https://github.com/solana-labs/solana-program-library/tree/54695b233484722458b18c0e26ebb8334f98422c/token/program-2022)
  - Final report
    https://github.com/solana-labs/security-audits/blob/master/spl/ZellicToken2022Audit-2022-12-05.pdf
- Trail of Bits
  - Review commit hash
    [`50abad`](https://github.com/solana-labs/solana-program-library/tree/50abadd819df2e406567d6eca31c213264c1c7cd/token/program-2022)
  - Final report
    https://github.com/solana-labs/security-audits/blob/master/spl/TrailOfBitsToken2022Audit-2023-02-10.pdf
- NCC Group
  - Review commit hash
    [`4e43aa`](https://github.com/solana-labs/solana/tree/4e43aa6c18e6bb4d98559f80eb004de18bc6b418/zk-token-sdk)
  - Final report
    https://github.com/solana-labs/security-audits/blob/master/spl/NCCToken2022Audit-2023-04-05.pdf
- OtterSec
  - Review commit hash
    [`e92413`](https://github.com/solana-labs/solana-program-library/tree/e924132d65ba0896249fb4983f6f97caff15721a)
  - Final report
    https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecToken2022Audit-2023-11-03.pdf
- OtterSec (ZK Token SDK)
  - Review commit hash
    [`9e703f8`](https://github.com/solana-labs/solana/tree/9e703f8/zk-token-sdk)
  - Final report
    https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecZkTokenSdkAudit-2023-11-04.pdf
