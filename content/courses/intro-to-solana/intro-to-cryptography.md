---
title: Cryptography and the Solana Network
objectives:
  - Understand symmetric and asymmetric cryptography
  - Explain keypairs
  - Generate a new keypair
  - Load a keypair from an env file
description: "Understand asymmetric cryptography and how Solana uses it."
---

## Summary

- A **keypair** is a matching pair of **public key** and **secret key**.
- The **public key** is used as an “address” that points to an account on the
  Solana network. A public key can be shared with anyone.
- The **secret key** is used to verify authority over the account. As the name
  suggests, you should always keep secret keys _secret_.
- `@solana/web3.js` provides helper functions for creating a brand new keypair,
  or for constructing a keypair using an existing secret key.

## Lesson

In this lesson, we will explore the basics of cryptography and how it's applied
within the Solana ecosystem.

### Symmetric and Asymmetric Cryptography

'Cryptography' the study of hiding information. There are two main types of
cryptography you'll encounter day to day:

**Symmetric Cryptography** is where the same key is used to encrypt and decrypt.
It's hundreds of years old and has been used by everyone from the ancient
Egyptians to Queen Elizabeth I.

There's a variety of symmetric cryptography algorithms, but the most common
you'll see today are AES and Chacha20.

**Asymmetric Cryptography**

- Asymmetric cryptography - also called
  '[public key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography)'
  was developed in the 1970s. In asymmetric cryptography, participants have
  pairs of keys (or **keypairs**). Each keypair consists of a **secret key** and
  a **public key**. Asymmetric encryption works differently from symmetric
  encryption, and can do different things:

- **Encryption**: if it's encrypted with a public key, only the secret key from
  the same keypair can be used to read it
- **Signatures**: if it's encrypted with a secret key, the public key from the
  same keypair can be used to prove the secret key holder signed it.
- You can even use asymmetric cryptography to work out a good key for symmetric
  cryptography! This is called **key exchange**, where you use your public keys
  and the recipient's public key to come up with a 'session' key.
- There's a variety of asymmetric cryptography algorithms, but the most common
  you'll see today are variants of ECC or RSA.

Asymmetric encryption is very popular:

- Your bank card has a secret key inside it that's used to sign transactions.

  Your bank can confirm you made the transaction by checking them with the
  matching public key.

- Websites include a public key in their certificate. Your browser will use this
  public key to encrypt the data (like personal information, login details, and
  credit card numbers) it sends to the web page.

  The website has the matching private key so that the website can read the
  data.

- Your electronic passport was signed by the country that issued it to ensure
  the passport isn't forged.

  The electronic passport gates can confirm this using the public key of your
  issuing country.

- The messaging apps on your phone use key exchange to make a session key.

In short, cryptography is all around us. Solana, as well as other blockchains,
are but one use of cryptography.

### Solana uses public keys as addresses

![Solana wallet addresses](/public/assets/courses/unboxed/wallet-addresses.svg)

People participating in the Solana network have at least one keypair. In Solana:

- The **public key** is used as an “address” that points to an account on the
  Solana network. Even friendly names - like `example.sol` - point to addresses
  like `dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8`

- The **secret key** is used to verify authority over that keypair. If you have
  the secret key for an address, you control the tokens inside that address. For
  this reason, as the name suggests, you should always keep secret keys
  _secret_.

### Using @solana/web3.js to make a keypair

You can use the Solana blockchain from either the browser or node.js with the
`@solana/web3.js` npm module. Set up a project how you normally would, then
[use `npm`](https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/)
to install `@solana/web3.js`

```shell
npm i @solana/web3.js@1
```

We'll cover a lot of
[web3.js](https://solana.com/docs/clients/javascript-reference) gradually
throughout this course, but you can also check out the
[official web3.js documentation](https://solana.com/docs/clients/javascript-reference).

To send tokens, send NFTS, or read and write data Solana, you'll need your own
keypair. To make a new keypair, use the `Keypair.generate()` function from
`@solana/web3.js`:

```typescript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
```

<Callout type="warning" title="Do not include secret keys in your source code">

Since the keypair can be regenerated from the secret key, we usually only store
the secret key, and restore the keypair from the secret key.

Additionally, since the secret key gives authority over the address, we don't
store secret keys in source code. Instead, we:

- Put secret keys in a `.env` file
- Add `.env` to `.gitignore` so the `.env` file is not committed.

</Callout>

### Loading an existing keypair

If you already have a keypair you'd like to use, you can load a `Keypair` from
an existing secret key stored in the filesystem or an `.env` file. In node.js,
the `@solana-developers/helpers` npm package includes some extra functions:

```bash
npm i @solana-developers/helpers
```

- To use an `.env` file use `getKeypairFromEnvironment()`
- To use a Solana CLI file use `getKeypairFromFile()`

```typescript
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
```

You know how to make and load keypairs! Let's practice what we've learned.

## Lab

In this lab we will learn about keypairs, and how to store secret keys securely
on solana

### Installation

Make a new directory, install TypeScript, Solana web3.js and esrun:

```bash
mkdir generate-keypair
cd generate-keypair
npm init -y
npm install typescript @solana/web3.js@1 esrun @solana-developers/helpers@2
```

Make a new file called `generate-keypair.ts`

```typescript
import { Keypair } from "@solana/web3.js";
const keypair = Keypair.generate();
console.log(`✅ Generated keypair!`);
```

Run `npx esrun generate-keypair.ts`. You should see the text:

```
✅ Generated keypair!
```

Each `Keypair` has a `publicKey` and `secretKey` property. Update the file:

```typescript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`✅ Finished!`);
```

Run `npx esrun generate-keypair.ts`. You should see the text:

```
The public key is:  764CksEAZvm7C1mg2uFmpeFvifxwgjqxj2bH6Ps7La4F
The secret key is:  Uint8Array(64) [
  (a long series of numbers)
]
✅ Finished!
```

## Loading an existing keypair from an .env file

To ensure that your secret key stays secure, we recommend injecting the secret
key using a `.env` file:

Make a new file called `.env` with the contents of the key you made earlier:

```env
SECRET_KEY="[(a series of numbers)]"
```

We can then load the keypair from the environment. Update `generate-keypair.ts`:

```typescript
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `✅ Finished! We've loaded our secret key securely, using an env file!`,
);
```

Run `npx esrun generate-keypair.ts`. You should see the following result:

```text
✅ Finished! We've loaded our secret key securely, using an env file!
```

We've now learned about keypairs, and how to store secret keys securely on
Solana. In the next chapter, we'll use them!

<Callout type="success">
## Completed the lab?

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=ee06a213-5d74-4954-846e-cba883bc6db1)!
</Callout>
