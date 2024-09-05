---
title: How to Approach the Program Security Course
objectives:
  - Understand how to approach the Program Security Course
description:
  "Learn how to think intelligently about security for your onchain programs,
  whether developing in Anchor or Native Rust."
---

## Overview

This course aims to introduce you to a range of common security exploits unique
to Solana development. We’ve modeled this course heavily on Coral's
[Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks) repository.

Program security is covered in our
[Anchor](/content/courses/onchain-development.md) and
[Native Rust](/content/courses/native-onchain-development.md) development
courses to ensure that anyone deploying programs to Mainnet has at least a basic
understanding of security. Those courses should help you avoid some common
Solana exploits on your own.

This course builds on those courses with two main goals:

1. Expand your awareness of the Solana programming model and highlight areas
   where you need to focus to close security loopholes.
2. Introduce you to the tools provided by Anchor to help keep your programs
   secure, and show native Rust users how to implement similar techniques on
   their own.

While the first few lessons in this course cover topics similar to those in the
[Anchor course](/content/courses/onchain-development/intro-to-anchor.md) or
[Program Security lesson](/content/courses/native-onchain-development/program-security.md)
in the [Native Course](/content/courses/native-onchain-development.md), but as
you progress, you’ll encounter new types of attacks. We encourage you to explore
all of them.

<Callout>

Unlike the lessons in other courses, which are in order, you are welcome to
explore these lessons in whatever order suits you best. </Callout>

Even though each security vulnerability may seem "simple," there's a lot to
discuss. These lessons contain less prose and more code, ensuring you gain a
solid understanding of the security risks discussed.

As always, your feedback is appreciated. Good luck as you delve into the course!
