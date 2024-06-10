---
date: 2024-04-25T00:00:00Z
difficulty: beginner
title: Port Anchor to Unity
description:
  Using Anchor IDL you can interact with your program directly from unity
tags:
  - games
  - anchor
  - program
  - unity
  - rust
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - example
---

If you have written a Solana program, you can use it in the Unity game engine
using a code generator that lets you port an Anchor IDL (a JSON representation
of a Solana program) to C#.

## Generating the Client

When using Anchor you will be able to generate an IDL file which is a JSON
representation of your program. With this IDL you can then generate different
clients. For example JavaScript or C# for Unity.

[IDL to C# Converter](https://github.com/magicblock-labs/Solana.Unity.Anchor)

These two lines will generate a C# client for the game.

```js
dotnet tool install Solana.Unity.Anchor.Tool
dotnet anchorgen -i idl/file.json -o src/ProgramCode.cs
```

This will generate you a C# representation of you program, which lets you
deserialize the data and easily create instructions to the program.

## Building the Transaction in Unity C#

Within Unity game engine we can then use the
[Solana Unity SDK](https://assetstore.unity.com/packages/decentralization/infrastructure/solana-sdk-for-unity-246931)
to interact with the program.

1. First we find the onchain address of the game data account with
   TryFindProgramAddress. We need to pass in this account to the transaction so
   that the Solana runtime knows that we want to change this account.
2. Next we use the generated client to create a MoveRight instruction.
3. Then we request a block hash from an RPC node. This is needed so that Solana
   knows how long the transaction will be valid.
4. Next we set the fee payer to be the players wallet.
5. Then we add the move right instruction to the transaction. We can also add
   multiple instructions to a singe transaction if needed.
6. Afterwards the transaction gets signed and then send to the RPC node for
   processing. Solana has different Commitment levels. If we set the commitment
   level to Confirmed we will be able to get the new state already within the
   next 500ms.

7. [Unity Client](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas/unity/Assets/SolPlay/Examples/TinyAdventure)

```c#
public async void MoveRight()
{
    PublicKey.TryFindProgramAddress(new[]
    {
        Encoding.UTF8.GetBytes("level1")
    },
    ProgramId, out gameDataAccount, out var bump);

    MoveRightAccounts account = new MoveRightAccounts();
    account.GameDataAccount = gameDataAccount;
    TransactionInstruction moveRightInstruction = TinyAdventureProgram.MoveRight(account, ProgramId);

    var walletHolderService = ServiceFactory.Resolve<WalletHolderService>();
    var result = await walletHolderService.BaseWallet.ActiveRpcClient.GetRecentBlockHashAsync(Commitment.Confirmed);

    Transaction transaction = new Transaction();
    transaction.FeePayer = walletHolderService.BaseWallet.Account.PublicKey;
    transaction.RecentBlockHash = result.Result.Value.Blockhash;
    transaction.Signatures = new List<SignaturePubKeyPair>();
    transaction.Instructions = new List<TransactionInstruction>();
    transaction.Instructions.Add(moveRightInstruction);

    Transaction signedTransaction = await walletHolderService.BaseWallet.SignTransaction(transaction);

    RequestResult<string> signature = await walletHolderService.BaseWallet.ActiveRpcClient.SendTransactionAsync(
        Convert.ToBase64String(signedTransaction.Serialize()),
        true, Commitment.Confirmed);
}
```

A full example of a Unity game that interacts with an Anchor program can be
found in the Solana Game Preset which you can find
[here](/content/guides/games/game-examples.md).
