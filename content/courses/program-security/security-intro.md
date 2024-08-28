---
title: How to approach the Program Security module
objectives:
  - understand how to approach the Program Security Module
description:
  "Learn how to think intelligently about security for your onchain programs,
  whether developing in Anchor or in Native Rust."
---

## Overview

The goal of this course is to expose you to a wide variety of common security
exploits that are unique to Solana development. We’ve heavily modeled this
course off Coral's
[Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks) repo.

We've covered program security in our
[Anchor](/content/courses/onchain-development.md) and
[native Rust](/content/courses/native-onchain-development.md) development courses
because we wanted to make sure that anyone deploying programs to Mainnet right
out of the gates had at least a basic understanding of security. And if that’s
you then hopefully the fundamental principles you learned in that lesson have
led to you avoiding some common Solana exploits on your own.

This unit is meant to build on top of that lesson with two goals in mind:

1. To expand your awareness of the Solana programming model and the areas where
   you need to focus to close up security loopholes in your programs
2. To show you the array of tools provided by Anchor to help you keep your
   programs secure

If you went through the Basic Security lesson, the first few lessons should seem
familiar. They largely cover topics we discussed in that lesson. After that,
some of the attacks may seem new. We encourage you to go through all of them.

The last thing to call out is that there are a lot more lessons in this course
than in prior course. And the lessons aren't dependent on each other in the same
ways, so you can bounce around a bit more if you'd like.

Originally, we were going to have more, shorter lessons in this course. And
while they might be shorter than average, they aren't much shorter. It turns out
that even though each of the security vulnerabilities is "simple," there's a lot
to discuss. So each lesson may have a little bit less prose and more code
snippets, making it easy for readers to choose how in depth to go. But,
ultimately, each lesson is still as fully-fledged as they have been before so
that you can really get a solid grasp on each of the discussed security risks.

As always, we appreciate feedback. Good luck digging in!
