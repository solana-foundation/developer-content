### Introduction to Anchor

Anchor abstracts away the complexities of directly interacting with the Solana program library (SPL), offering developers a cleaner and more intuitive way to build decentralized applications (dApps). It leverages Rust's type safety and the expressiveness of its syntax to ensure that smart contracts are both secure and easy to write.

#### Why Use Anchor?

* **Simplified Development**: Anchor provides a set of tools and libraries that simplify the process of writing Solana smart contracts, making it accessible to those who may not be deeply familiar with blockchain development.
    
* **Safety and Security**: Built on Rust, Anchor inherits Rust's emphasis on safety and memory management, reducing the risk of vulnerabilities in smart contracts.
    
* **Rapid Testing and Deployment**: With Anchor, developers can quickly test their programs in a local environment before deploying them to the Solana blockchain, ensuring a smooth development process.
    

### Writing the program

To begin with Anchor, you'll typically start by setting up your development environment, and you can do this by following the [official installation](https://www.anchor-lang.com/docs/installation) on the anchor documentation. However, for this tutorial, we will leverage the Solana Anchor playground, a web-based IDE that allows you to write, compile, and deploy Anchor programs without any local setup.

#### Using Solana Anchor Playground

The Solana Anchor playground is an excellent tool for newcomers and experienced developers alike, offering a hassle-free environment to experiment with Anchor projects. Here's how you can get started:

1. **Access the Playground**: Navigate to the Solana Anchor playground website. This web-based IDE is designed to provide you with a pre-configured environment for Anchor development.
    
2. **Explore Sample Projects**: The playground often comes with sample projects that you can review and modify. These samples provide a solid foundation for understanding how Anchor projects are structured and how they interact with the Solana blockchain.
    
3. **Write Your Smart Contract**: Start by writing your Anchor smart contract in the playground's code editor. Anchor's syntax and APIs are designed to be intuitive for those familiar with Rust, allowing you to define instructions, accounts, and data structures with ease.
    
4. **Compile and Deploy**: Use the playground's built-in tools to compile your Anchor program and deploy it to a simulated Solana blockchain environment. This step is crucial for testing the functionality and performance of your smart contract.
    
5. **Interact with Your Contract**: After deploying your contract, you can interact with it directly from the playground, simulating transactions and querying state to ensure that everything works as expected.
    

### Understanding the Anchor Code Structure

Building on Solana with Anchor involves creating sophisticated smart contracts leveraging Rust's strong type system and Anchor's framework to simplify development. In the project tutorial, we build an exemplified smart contract for a hypothetical Heroes application, where you can create and update hero profiles. This section breaks down the key components of the code, providing insights into how to harness the power of Anchor for building robust Solana applications.

This complete Anchor program includes functionalities to create and update a hero's profile with attributes such as name, age, and bio.

#### Declaring the Program ID

```rust
declare_id!("4axWNQPo1BuJvCwS5yYf1AJ6sF3AeaH7fMGSHTMEUM5A");
```

Every Anchor program requires a unique program ID. This ID links your on-chain program to your off-chain code.

Take this as the address of the program, similar to that of ethereum.

#### The Main Module

```rust
#[program]
mod heroes {
    // Function implementations...
}
```

The `#[program]` attribute designates this module as containing the smart contract's entry points. We'll get to this later.

### Defining the Hero Account

The `Hero` struct is at the heart of our application. It represents a hero profile with attributes such as `name`, `age`, `bio`, and more.

The Rust `#[account]` macro from Anchor is pivotal here, marking the struct as an on-chain account. This macro prepares `Hero` for serialization and storage in the Solana blockchain's account model.

```rust
#[account]
pub struct Hero {
    name: String,
    age: i32,
    bio: String,
    author: Pubkey,
    created_at: i64,
}
```

Each field within the `Hero` struct carries significant information about a hero, from the basic `name` and `age` to a `bio` that provides a deeper narrative. The `author` field, holding a `Pubkey`, denotes ownership and establishes a relationship between the hero profile and its creator. The `created_at` timestamp captures the moment of creation, offering chronological context.

### **The Concept of Rent on Solana**

Solana charges rent for the storage of data on the blockchain to prevent the ledger from becoming bloated with inactive accounts. This rent is a fee calculated based on the size of the account and the current rent rate, which is determined by the network. Accounts that do not hold enough SOL to cover their rent for an extended period can be purged, ensuring that only active and funded accounts consume storage resources.

### **Calculating Rent**

Rent on Solana is calculated based on the size of the account (in bytes) and the duration for which space is rented. The Solana documentation provides a rent calculator and formulas for developers to estimate the rent costs associated with their accounts.

The formula for calculating rent is essentially:

```bash
makefileCopy codeRent = Account Size in Bytes * Rent Rate
```

Every program is meant to pay some SOL in form of RENT for it's state on the Solana blockchain, to prevent the risk of removal. The most common way is deploy rent exempt programs. These are programs that are deployed with enough SOL rent to cover for over 2 years on chain. When this is done, the program is declared rent-exempt program.

The amount of SOL required to make program rent-exempt, is determined by calculating it's byte size before deploying as shown in the next section.

### Account Size Calculation

Blockchain storage is not infinite, nor is it free. Each byte stored consumes resources, translating to costs for users and developers. This reality necessitates precise calculations of account sizes to ensure efficient and cost-effective storage.

Solana has a precise way of calculating

```rust
const DISCRIMINATOR_LENGTH: usize = 8;
const MAX_NAME_LENGTH: usize = 50 * 4; // maximum is 50
const AGE_LENGTH: usize = 4;
const MAX_BIO_LENGTH: usize = 240 * 4; // maximum is 240
const TIMESTAMP_LENGTH: usize = 8;
const AUTHOR_LENGTH: usize = 32;
```

Anchor requires a clear definition of how much space an account will occupy. This section meticulously outlines each component of the `Hero` account's size, from the discriminator (a unique identifier for Anchor to distinguish account types) to the maximum lengths of variable-sized fields like `name` and `bio`.

### Implementing the Total Size

After detailing each component's size, we sum them to establish the `Hero` account's total size. This calculation ensures that the blockchain allocates enough space to store all necessary information without wasting resources.

```rust
impl Hero {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + MAX_NAME_LENGTH
        + AGE_LENGTH
        + MAX_BIO_LENGTH
        + TIMESTAMP_LENGTH
        + AUTHOR_LENGTH;
}
```

This implementation block for `Hero` defines a constant `LEN`, representing the total bytes required to store a `Hero` account. It's a sum of all previously defined constants, carefully accounting for every piece of data the `Hero` struct will hold.

In this section of our Solana development series, we delve into the heart of account management and smart contract functionality on Solana using Anchor, a framework that simplifies Solana's Sealevel runtime. We will explore how to define the functionality for adding a hero to our decentralized application (dApp).

### Understanding the CreateHero Struct

The `CreateHero` struct is crucial for creating new hero accounts within our dApp. It leverages Anchor's powerful macros and Solana's account model to securely and efficiently manage blockchain state.

```rust
#[derive(Accounts)]
pub struct CreateHero<'info> {
    #[account(init, payer=author, space=Hero::LEN )]
    pub hero: Account<'info, Hero>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

Let's break down the key components:

* `#[derive(Accounts)]`: This macro from Anchor prepares the struct for working with Solana accounts by implementing necessary traits. It signifies that the `CreateHero` struct will define the accounts required by the `create_hero` instruction.
    
* `#[account(init, payer=author, space=Hero::LEN)]`: This attribute specifies that the `hero` account is to be initialized. The `init` keyword indicates creation of a new account. The `payer=author` parameter specifies that the transaction's signer, who is the author, will pay the rent for this new account. The `space=Hero::LEN` parameter allocates storage space for the hero account based on the calculated length (`LEN`) from the `Hero` struct, ensuring enough space is reserved for all the hero's data.
    
* `pub hero: Account<'info, Hero>,`: This line declares the `hero` account with the data type specified by the `Hero` struct. It represents the state of a hero in our dApp.
    
* `#[account(mut)]`: The `mut` keyword marks the `author` account as mutable, meaning it can be modified during the execution of the instruction. This is necessary because creating a hero account will deduct the account creation cost from the author's balance.
    
* `pub author: Signer<'info>,`: This specifies the transaction's signer. In our dApp's context, the author is the user who initiates the transaction to create a new hero account.
    
* `pub system_program: Program<'info, System>,`: This line includes Solana's `System` program in our instruction. The `System` program is responsible for fundamental blockchain operations like creating accounts. By including it, we ensure that our instruction has the necessary permissions to interact with the blockchain at a low level.
    

### The Role of CreateHero

The `CreateHero` struct serves as the blueprint for the `create_hero` function (not shown here). When a user calls this function, they must provide the necessary information (name, age, bio) and sign the transaction. Anchor and Solana's runtime use the definitions in `CreateHero` to validate the transaction, initialize the hero account with the provided data, and deduct the required SOL to cover the rent from the author's account.

This approach abstracts away the complexities of account management and Solana's low-level APIs, allowing developers to focus on the logic of their dApp. By leveraging structs like `CreateHero` and Anchor's macros, developers can define clear, secure, and efficient instructions for interacting with the blockchain.

This snippet is a critical part of our Solana dApp, where we define the `create_hero` function using Anchor, a framework that simplifies Solana smart contract development. This function is responsible for creating a new hero account with the provided attributes: name, age, and bio. Let's break down how it works and its significance.

### Function Definition

```rust
pub fn create_hero(
    ctx: Context<CreateHero>,
    name: String,
    age: i32,
    bio: String,
) -> Result<()> {
    // Function body
}
```

* `ctx: Context<CreateHero>`: This parameter is a context that holds the accounts needed for the execution of this function, as defined in the `CreateHero` struct. It ensures that all necessary accounts are available and properly configured.
    
* `name`, `age`, `bio`: These parameters are the hero's attributes provided by the user. They will be stored in the newly created hero account.
    

### Function Logic

1. **Account References**: The function first obtains mutable references to the `hero` and `author` accounts from the context. This allows modifying these accounts within the function.
    
    ```rust
    let hero = &mut ctx.accounts.hero;
    let author = &mut ctx.accounts.author;
    ```
    
2. **Timestamp**: It retrieves the current timestamp from the blockchain's clock. This timestamp is used to record when the hero was created.
    
    ```rust
    let clock = Clock::get().unwrap();
    ```
    
3. **Data Validation**: Before creating the hero, the function validates the `name` and `bio` lengths to ensure they do not exceed predetermined limits. If any of these validations fail, the function returns an error, preventing the creation of the hero account with invalid data.
    
    ```rust
    if name.chars().count() > 50 {
        return Err(ErrorCode::NameTooLong.into());
    }
    if bio.chars().count() > 240 {
        return Err(ErrorCode::BioTooLong.into());
    }
    ```
    
4. **Creating the Hero**: After passing the validation checks, the function populates the hero account with the provided data: `name`, `age`, `bio`, the `author`'s public key as the hero's creator, and the current `timestamp` as the creation date.
    
    ```rust
    hero.name = name;
    hero.age = age;
    hero.bio = bio;
    hero.author = author.key();
    hero.created_at = clock.unix_timestamp;
    ```
    
5. **Completion**: Finally, the function returns `Ok(())`, indicating successful execution.
    

### Importance

This function exemplifies how smart contracts on Solana, written with Anchor, can perform complex operations such as account creation, data validation, and state management in a secure and efficient manner. By encapsulating these operations within a single function, Anchor provides a powerful abstraction that simplifies Solana smart contract development, making it more accessible to developers.

The use of `Result<()>` as the return type allows for robust error handling. By leveraging Rust's powerful type system and error handling capabilities, the function can gracefully handle failures, ensuring that invalid or malicious inputs do not compromise the dApp's integrity.

Overall, the `create_hero` function is a foundational piece of the dApp, enabling users to add new heroes to the program with verifiable attributes, while ensuring data integrity and security through meticulous validations.

The `UpdateHero` struct, annotated with `#[derive(Accounts)]`, is pivotal for defining the accounts required by the `update_hero` function in our Solana smart contract. Let's dissect its components and understand its role within the contract.

### The UpdateHero Account

To extend our program abit further, we may want to have a way of updating our heros in the program, and we can do this using the Update Hero struct.

The `UpdateHero` struct serves as a template for the accounts needed when updating a hero's information. By defining these requirements upfront, Anchor can automatically handle much of the boilerplate associated with account validation and deserialization, allowing developers to focus on the business logic of their program.

When a request to update a hero is made, the transaction must include the specific hero account to be updated and the signer's account. The constraints defined in `UpdateHero` ensure that:

* The hero account is writable (`mut`).
    
* The signer is the original creator of the hero account (`has_one = author`), providing a secure way to manage updates.
    

This struct exemplifies how Anchor simplifies Solana smart contract development by abstracting away the complexities of account management and security, allowing developers to define clear, enforceable rules for how and by whom data can be modified.

```rust
#[derive(Accounts)]
pub struct UpdateHero<'info> {
    #[account(mut, has_one = author)]
    pub hero: Account<'info, Hero>,
    pub author: Signer<'info>,
}
```

* `#[derive(Accounts)]` is an Anchor attribute that auto-implements the `Accounts` trait for the `UpdateHero` struct. This trait is crucial for validating and deserializing accounts passed into a Solana program.
    
* `'info` is a lifetime parameter, indicating that the `UpdateHero` struct and its fields have a relationship to the lifetime of the transaction's execution context.
    

### Fields

1. `hero: Account<'info, Hero>`: This field represents the hero account to be updated. The `Account<'info, Hero>` type specifies that this is an account holding a `Hero` struct.
    
    * `mut` signals that this account will be mutated, meaning the `update_hero` function intends to modify the data stored in this hero account.
        
    * `has_one = author` is a constraint that enforces the `author` field of the `Hero` account (the hero's creator) must match the public key of the `author` signer in this transaction. This ensures only the original creator of a hero can update it, adding a layer of authorization and security.
        
2. `author: Signer<'info>`: This field represents the transaction's signer, who must be the author (creator) of the hero account being updated. The `Signer` type indicates that this account is required to sign the transaction, providing the necessary authorization to make changes.
    

### The UpdateHero Function

The `update_hero` function is a crucial part of our Solana smart contract, allowing for the modification of an existing hero's attributes. It leverages Rust's pattern matching and `Option` type to conditionally update the hero's name, age, and bio based on the provided inputs. Let's break down how it works:

```rust
pub fn update_hero(
        ctx: Context<UpdateHero>,
        name: Option<String>,
        age: Option<i32>,
        bio: Option<String>,
    ) -> Result<()> {
        // Some("Jack") None
        let hero = &mut ctx.accounts.hero;

        if let Some(name) = name {
            if name.chars().count() > 50 {
                return Err(ErrorCode::NameTooLong.into());
            }
            hero.name = name;
        }

        if let Some(bio) = bio {
            if bio.chars().count() > 240 {
                return Err(ErrorCode::BioTooLong.into());
            }
            hero.bio = bio;
        }

        if let Some(age) = age {
            hero.age = age;
        }

        Ok(())
    }
```

* `ctx: Context<UpdateHero>`: The context parameter is a container for the accounts involved in this operation. `UpdateHero` specifies the account constraints and relationships required for the update operation, ensuring that only the hero's author can update the hero's details.
    
* `name: Option<String>`, `age: Option<i32>`, `bio: Option<String>`: These parameters are wrapped in Rust's `Option` type, allowing them to be either `Some(value)` or `None`. This design choice enables partial updates; clients can update any combination of a hero's name, age, and bio without needing to provide all three parameters.
    

### Function Body

1. **Conditional Updates**: The function first checks if a new value has been provided for each of the hero's attributes (name, age, bio). It uses Rust's `if let Some(value) = option` syntax to execute code blocks only if the optional parameters contain values.
    
2. **Validation**: Before updating the hero's attributes, it validates the length of the name and bio to ensure they do not exceed predefined limits (50 characters for name, 240 characters for bio). If any attribute exceeds its limit, an error is returned, halting the update process.
    
3. **Applying Updates**: If the validations pass, the hero's attributes are updated with the new values provided.
    

**Error Handling**

The function uses custom error codes (`ErrorCode::NameTooLong`, `ErrorCode::BioTooLong`) to provide meaningful feedback in case of invalid input. These error codes are part of an enum defined elsewhere in the contract, leveraging Anchor's error handling mechanisms to communicate issues to the caller.

**Full code**

```rust
use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("4axWNQPo1BuJvCwS5yYf1AJ6sF3AeaH7fMGSHTMEUM5A");
#[program]
mod heroes {
    use super::*;
    pub fn create_hero(
        ctx: Context<CreateHero>,
        name: String,
        age: i32,
        bio: String,
    ) -> Result<()> {
        let hero = &mut ctx.accounts.hero;
        let author = &mut ctx.accounts.author;
        let clock = Clock::get().unwrap();

        // 🔐 Guard from invalid and too long data...
        if name.chars().count() > 50 {
            // throw an error
            return Err(ErrorCode::NameTooLong.into());
        }

        if bio.chars().count() > 240 {
            // Throw an error
            return Err(ErrorCode::BioTooLong.into());
        }

        // Create the hero...
        hero.name = name;
        hero.age = age;
        hero.bio = bio;
        hero.author = author.key();
        hero.created_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn update_hero(
        ctx: Context<UpdateHero>,
        name: Option<String>,
        age: Option<i32>,
        bio: Option<String>,
    ) -> Result<()> {
        // Some("Jack") None
        let hero = &mut ctx.accounts.hero;

        if let Some(name) = name {
            if name.chars().count() > 50 {
                return Err(ErrorCode::NameTooLong.into());
            }
            hero.name = name;
        }

        if let Some(bio) = bio {
            if bio.chars().count() > 240 {
                return Err(ErrorCode::BioTooLong.into());
            }
            hero.bio = bio;
        }

        if let Some(age) = age {
            hero.age = age;
        }

        Ok(())
    }
}

// Result will return -> Ok(result) | Err(error)

// Funtionality -> Add a hero (Info: name, age, universe())  CRUD
// Create the Hero... (name, age, bio..)
#[derive(Accounts)]
pub struct CreateHero<'info> {
    #[account(init, payer=author, space=Hero::LEN )]
    pub hero: Account<'info, Hero>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateHero<'info> {
    #[account(mut, has_one=author)]
    pub hero: Account<'info, Hero>,
    pub author: Signer<'info>,
}

// Hero Account info
#[account]
pub struct Hero {
    name: String,
    age: i32,
    bio: String,
    author: Pubkey,
    created_at: i64,
}

// 2. Constants to calculate the size of Hero account
const DISCRIMINATOR_LENGTH: usize = 8;
const MAX_NAME_LENGTH: usize = 50 * 4; // maximum is 50
const AGE_LENGTH: usize = 4;
const MAX_BIO_LENGTH: usize = 240 * 4; // maximum is 240 * 4
const TIMESTAMP_LENGTH: usize = 8;
const AUTHOR_LENGTH: usize = 32;

// 3. Add a implementation to find the total size of the Hero Account
impl Hero {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + MAX_NAME_LENGTH
        + AGE_LENGTH
        + MAX_BIO_LENGTH
        + TIMESTAMP_LENGTH
        + AUTHOR_LENGTH;
}

#[error_code]
pub enum ErrorCode {
    #[msg("The name MUST not exceed 50 characters")]
    NameTooLong,
    #[msg("You bio MUST not exceed 240 characters")]
    BioTooLong,
}

// 1. handling state / State management (accounting system) ✅
// 2. CRUD functions | Changing state | Mutating (accounts)
// 3. Testing
// 4. Deploying
```

We've covered the most important pieces of the program, now we can compile and deploy and test the program.
