---
date: 2024-02-27
difficulty: intermediate
featured: true
featuredPriority: 1
title: "Build on Solana From Rust Basics to Advanced Development"
seoTitle: "Building and Deploying a Solana Smart Contract with Rust and Anchor"
description: "Dive deep into blockchain development with our comprehensive guide on building and deploying a Solana smart contract using Rust and Anchor, From basic Rust"
tags:
  - Solana Playground
  - Anchor
  - Rust
  - Smart Contract
  - Blockchain Development
keywords:
  - Solana Playground
  - Anchor framework
  - Smart contracts
  - Rust programming
  - Blockchain tutorial
  - Solana development
  - Web3 development
  - Decentralized applications
altRoutes:
  - /developers/guides/creating-heroes-on-solana
  - /developers/tutorials/anchor-browser-development
---

This guide leverages [Solana Playground](https://beta.solpg.io), a powerful browser-based IDE, to teach you how to build, test, and deploy a Solana smart contract. From creating heroic through CRUD operations, learn everything in the comfort of your browser. No downloads required.

## What you will learn

- rust basic syntax
- rust functions
- rust structs and implementations
- rust ownership and borrowing
- rust references without ownership

## Introduction

In our in-depth tutorial series where we explore the journey of building on Solana, starting from the very basics of Rust programming to the intricacies of Solana development. Solana stands out in the blockchain space for its incredible speed and efficiency, making it an exciting platform for developers. Our journey will take us from understanding Rust, a powerful language that forms the backbone of Solana development, to creating our first Solana program using Anchor, a framework designed to make Solana development easier and more intuitive.

This article is based on the Build On Solana full tutorial series covered on [youtube](https://www.youtube.com/playlist?list=PLOYP_hXwmI98jGlDcRWBucm_Zl_2lie-x).

### **Rust for Blockchain Development**

Rust is a multi-paradigm programming language known for its safety and performance. It's the foundation upon which Solana's lightning-fast blockchain is built. Before diving into Solana, getting comfortable with Rust is crucial.

Rust's ownership model, safety guarantees, and concurrency management make it an ideal language for blockchain development.

Due to it's powerful way of managing memory and fast execution, it is a common tool in many blockchains like Solana, Polkadot, Near and many more.

## Getting Started with Rust

Rust, is the powerful and efficient programming language that underpins the Solana blockchain. Rust is known for its emphasis on speed, memory safety, and concurrency, making it an ideal choice for developing high-performance blockchain applications.

To get started, you'll need to install Rust on your computer. This is a straightforward process that begins by visiting the official Rust website. There, you'll find the installation instructions that are specific to your operating system, be it Windows, macOS, or Linux. The website guides you through each step of the installation process, ensuring you have Rust ready to go on your system without any guesswork.

However, if you're keen on diving straight into Rust without the initial setup on your local machine, the [Rust Playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021) offers an excellent alternative. It's a browser-based tool that allows you to write, compile, and run Rust code directly from your web browser. The Rust Playground is accessible from anywhere at any time, making it incredibly convenient for those who wish to experiment with Rust code, debug existing projects, or simply explore the language's features.

Throughout this tutorial series, we will make extensive use of the Rust Playground. This approach not only simplifies the learning process but also allows you to engage with the content actively, trying out code samples and seeing the results instantly, all without the need for a local development environment.

The Rust Playground represents an ideal solution for beginners or anyone looking for a quick and easy way to experiment with Rust. It eliminates the barriers to entry, enabling you to focus fully on learning the language and exploring its potential in blockchain development.

In this section of our Solana development series, we delve into the fundamentals of Rust, starting with an essential building block: data types. Rust's type system is both rich and expressive, allowing developers to write safe and efficient code. Here, we explore various data types through a practical code snippet that illustrates their usage in Rust.

### Understanding Rust Data Types

Rust enforces type safety to ensure that operations are performed on compatible types, thereby reducing errors and enhancing code reliability. Let's break down some of the code snippets to understand the various data types and their nuances.

#### Numeric Types

Rust offers several numeric types, but here we focus on integers and floating-point numbers:

```rust
let x: i8 = 5;
let y: f64 = 3.5;
```

In this example, `x` is an 8-bit integer with a value of 5, while `y` is a 64-bit floating-point number with a value of 3.5. Rust's numeric type annotations allow us to specify the size and nature (integer or floating-point) of our numeric data precisely.

Attempting to perform an operation on `x` and `y` without type conversion results in a compile-time error due to type mismatch. However, we can resolve this by explicitly converting `x` to a `f64`:

```rust
let z_soln = x as f64 - y;
```

#### Booleans

Booleans in Rust are straightforward, represented by `true` or `false`:

```rust
let is_tall = true;
```

Variables in Rust are immutable by default, meaning once a value is assigned, it cannot be changed. This immutability is a core part of Rust's approach to safety and concurrency. To modify the value of a boolean (or any variable), we must explicitly declare it as mutable:

```rust
let mut is_tall = true;
is_tall = false;
```

#### Characters and Strings

Rust distinguishes between characters and strings. Characters are single Unicode scalars denoted by single quotes:

```rust
let my_char = 'A';
```

Strings, or more precisely, string slices (`&str`), are sequences of characters enclosed in double quotes. They are immutable references to a sequence of UTF-8 encoded characters:

```rust
let my_string = "A";
```

To modify a string slice variable, it must be mutable:

```rust
let mut first_name = "Clerk";
println!("{}", first_name);
first_name = "Bruce";
println!("{}", first_name);
```

#### Tuples

Tuples are collections of values of different types grouped together. They are incredibly useful for returning multiple values from a function:

```rust
let hero = ("Bruce", "Wayne", 45 as u8);
println!("Hero: {:?}", hero);
let hero_first_name = hero.1;
println!("First name: {}", hero_first_name);
```

Notice the use of type coercion for the age (`45 as u8`) and the debug printing style (`{:?}`) to unpack and display the tuple.

#### Arrays

Arrays are collections of values of the same type, with a fixed size:

```rust
let hero_names: [&str; 3] = ["Bruce", "Diana", "Clerk"];
println!("Heroes: {:?}", hero_names);
```

Arrays provide safety and performance by storing elements contiguously in memory. However, their size must be known at compile time, and all elements must be of the same type.

### Slicing Arrays

Slicing allows us to reference a contiguous sequence of elements in an array, effectively creating a "view" into the array without copying its contents:

```rust
let hero_ages: [i32; 5] = [45, 32, 55, 26, 42];
let first_four = &hero_ages[..4];
println!("{:?}", first_four);
```

This example demonstrates how to take a slice of the first four elements of `hero_ages`.

### Functions

Functions in Rust are defined using the `fn` keyword, followed by the function name, parameters, and the return type. They encapsulate code blocks that perform specific tasks and can return values to the calling code. Rust's powerful type system extends to function signatures, ensuring type safety and clarity in function definitions and calls.

#### Defining and Calling a Simple Function

Consider the task of generating a full name from a first name and a last name. This is a perfect use case for a function: it takes input, processes it, and returns a result. Here's how we could implement this in Rust:

```rust
pub fn get_fullname(first: &str, last: &str) -> String {
    let full_name = format!("{0} {1}", first, last);
    full_name
}
```

In this example, `get_fullname` is a public function (`pub`) that takes two string slices (`&str`) as parameters: `first` and `last`. It returns a `String` object that represents the full name. The function body uses the `format!` macro to concatenate the first name and the last name with a space between them, storing the result in the `full_name` variable. Finally, `full_name` is returned to the caller.

Notice how the function specifies its return type with `-> String`. This explicit return type is a requirement for functions that return a value. In Rust, the last expression in a function body is implicitly returned, making explicit `return` statements unnecessary in many cases. This is why `full_name` is returned without the `return` keyword.

### Understanding Ownership and Scoping

Rust enforces variable validity through scoping rules, ensuring that data is only accessible where it's supposed to be, thus preventing bugs and memory leaks.

```rust
pub fn scoping_ownership() {
    {
        let s = "hello world"; // s comes into scope
        // do stuff with s
    } // s goes out of scope and is no longer valid
}
```

Here, `s` is only valid within the braces that define its scope. Once the scope ends, `s` is no longer accessible, illustrating how Rust automatically cleans up and frees resources.

### String Ownership and Mutation

Ownership rules in Rust prevent data races at compile time and manage heap data efficiently. The `String` type, unlike string literals, is mutable and stored on the heap.

```rust
pub fn string_ownership() {
    let mut my_str = String::from("Hello ");
    my_str.push_str("World");
    println!("{}", my_str);
}
```

Mutating a `String` by appending "World" demonstrates ownership in action. When a variable like `my_str` goes out of scope, Rust automatically calls `drop` to free the heap memory.

### Copy Semantics in Rust

Rust differentiates between types that are `Copy` and those that are not, influencing how variables interact with ownership rules.

```rust
pub fn int_binding_varibles_ownership() {
    let x = 5;
    let y = x; // Here, y is a copy of x
}
```

Primitive types like integers implement the `Copy` trait, allowing for variable bindings to create a full copy of the data rather than transferring ownership.

### Moving and Cloning

For types that do not implement the `Copy` trait, such as `String`, Rust enforces move semantics to ensure safe memory management.

```rust
pub fn str_binding_variable_ownership() {
    let first_str = String::from("Hello");
    let sec_str = first_str.clone(); // Creates a deep copy
    println!("Works: {}", sec_str);
}
```

Using `clone` creates a deep copy of `String` data, a necessary step when you need to retain the original value after assignment to a new variable.

### Ownership and Functions

Ownership principles extend to function arguments and return values, enabling Rust to prevent memory leaks and dangling pointers.

```rust
pub fn ownership_and_functions() {
    let greet = String::from("Hello");
    takes_ownership(greet); // greet's ownership is moved

    let x = 10;
    makes_copy(x); // x is copied, not moved
    println!("Outside: {}", x);
}
```

Passing a `String` to a function transfers ownership, rendering it inaccessible post-call unless returned. Primitive types, however, are copied, not moved.

### Mutable References

Rust allows mutable references to change data without taking ownership, governed by strict rules to ensure safety.

```rust
pub fn mutable_refs() {
    let mut greet = String::from("Hello ");
    mutate_str(&mut greet);
}
```

Mutable references, like `&mut greet`, permit data mutation while enforcing rules that prevent data races, such as the prohibition of having more than one mutable reference to a particular piece of data in a single scope.

In the realm of Rust, the concepts of references and borrowing are pivotal for memory safety without the overhead of garbage collection. These concepts allow Rust programs to access data without taking ownership of it, enabling multiple parts of your code to read or modify data while maintaining the integrity and safety guarantees Rust is known for. This section explores how references and borrowing facilitate these interactions, particularly in the context of Solana blockchain development, where performance and safety are paramount.

### References to Data Without Ownership

References in Rust let you refer to some value without taking ownership of it. This is akin to looking at a book in a library without taking it home. You can read and use the book, but it remains in the library for others to access.

#### A Basic Reference Example

Let's look at a simple example that calculates the length of a `String` without taking ownership:

```rust
pub fn calculate_length() {
    let mystr = String::from("ChainDev");
    let str_len = find_len(&mystr);
    println!("The len of {} is {}", mystr, str_len);
}

fn find_len(some_str: &String) -> usize {
    some_str.len()
}
```

In this code, `find_len` takes a reference to a `String` (`&String`) instead of taking ownership. This way, `mystr` remains valid after `find_len` is called, and we can use it afterward. The ampersand (`&`) signifies that a reference is being passed.

### Borrowing, Modifying Data Without Ownership

While references allow read-only access to data, Rust also provides a way to modify data through mutable references. This is known as borrowing. However, Rust enforces strict rules to ensure safety and concurrency:

1. You can have either one mutable reference or any number of immutable references to a particular piece of data in a particular scope, but not both.
2. References must always be valid.

#### Modifying a String: Mutable References

Consider a function that appends text to a string:

```rust
pub fn changing_parent() {
    let mut greet = String::from("Hello ");
    change_me(&mut greet);
}

fn change_me(some_str: &mut String) {
    some_str.push_str(" World");
}
```

Here, `change_me` accepts a mutable reference to a `String` (`&mut String`), allowing it to modify the original string. Note the `mut` keyword in both the variable declaration (`let mut greet`) and the reference (`&mut greet`). This is necessary to make both the variable and the reference mutable, adhering to Rust's safety rules.

Structs in Rust play a crucial role in organizing data into logical groups, making it easier to manage and use complex data structures in your programs. This is particularly useful in Solana development, where you often deal with users, transactions, and other data-centric operations. Structs allow you to define custom data types that encapsulate related properties and behaviors.

### Defining and Using Structs

Rust's structs enable you to group related data fields together, forming a coherent unit. Let's explore how to define and use a `User` struct in a Rust program.

#### Defining a Struct

```rust
#[derive(Debug)]
pub struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```

Here, we define a `User` struct with four fields: `active`, `username`, `email`, and `sign_in_count`. The `#[derive(Debug)]` annotation allows us to print the struct for debugging purposes, showcasing Rust's flexibility in facilitating development.

#### Creating Instances

To utilize our `User` struct, we create instances of it and populate the fields with relevant data.

```rust
pub fn create_user() {
    let mut user_1 = User {
        username: String::from("Bruce"),
        active: true,
        email: String::from("bruce@wayne.com"),
        sign_in_count: 5,
    };
}
```

In this snippet, we create a mutable instance of `User` named `user_1` and initialize each field with specific values. Making `user_1` mutable allows us to later modify its fields.

#### Accessing and Modifying Fields

Fields of a struct instance can be accessed using the dot notation, and if the instance is mutable, fields can be modified as well.

```rust
let email = user_1.email;
user_1.active = false;
```

Here, we access the `email` field of `user_1` and modify the `active` field.

#### Constructing Structs with Functions

For more complex or repetitive struct construction, you can use functions to encapsulate the creation logic.

```rust
fn build_a_user(username: String, email: String) -> User {
    User {
        username,
        email,
        active: true,
        sign_in_count: 1,
    }
}
```

This function, `build_a_user`, simplifies creating a new `User` by taking `username` and `email` as parameters and returning a new `User` instance with some default values for `active` and `sign_in_count`.

Struct implementations and methods in Rust provide a way to define behavior associated with a struct, turning it from a simple data container into a more powerful and encapsulated object. This feature is especially useful in blockchain applications developed with Solana, where encapsulating logic and data together maintains code organization and clarity.

### Implementing Methods on Structs

Methods are defined within an `impl` block, allowing you to specify functions that are associated with a particular struct. These functions can read or modify the struct's data.

#### Defining a Struct with Methods

Consider a `Rectangle` struct that represents a geometric rectangle. We can define methods to calculate its area and modify its dimensions:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    length: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.length * self.width
    }

    fn change_len(&mut self) {
        self.length = 50;
    }
}
```

In this implementation:

- The `area` method calculates the area of the rectangle. It takes an immutable reference to `self`, indicating that it borrows the `Rectangle` instance without taking ownership. This allows us to read the `Rectangle`'s data without consuming it.
- The `change_len` method modifies the rectangle's length. It takes a mutable reference to `self`, allowing it to change the data within the struct. This method demonstrates how methods can alter the instance they belong to.

#### Using Struct Methods

Methods are called using the dot notation. This syntactic sugar allows you to call methods on a struct instance clearly and concisely:

```rust
pub fn create_rec() {
    let mut rect_1 = Rectangle {
        width: 15,
        length: 100,
    };

    let area = rect_1.area();
    println!("Area: {}", area);

    rect_1.change_len();
    println!("Rect 1: {:?}", rect_1);
}
```

In the `create_rec` function, we create an instance of `Rectangle`, calculate its area using the `area` method, and then modify its length with the `change_len` method. The use of mutable and immutable references (`&mut self` and `&self`) in method signatures controls how methods interact with the struct's data, ensuring safe access and modification patterns.

## Next steps

- [Introduction to anchor](/content/guides/buildadapp/introduction-to-anchor.md)
- [Deploy and test the program](/content/guides/buildadapp/deploy-and-testing-the-anchor-program.md)
