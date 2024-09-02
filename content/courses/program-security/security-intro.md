---
title: How to Approach the Program Security Module
objectives:
  - Understand how to approach the Program Security Module
description: >
  Learn how to think intelligently about security for your onchain programs,
  whether developing in Anchor or in Native Rust.
---

## Overview

The goal of this course is to expose you to a wide variety of common security exploits 
that are unique to Solana development. This course is heavily based on Coral's 
[Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks) repo.

We've already covered program security in our 
[Anchor](https://github.com/solana-foundation/developer-content/tree/main/content/courses/onchain-development) and 
[Rust native](https://github.com/solana-foundation/developer-content/tree/main/content/courses/native-onchain-development) development 
courses because we want to ensure that anyone deploying programs to Mainnet has at least a 
basic understanding of security. If that's you, we hope the fundamental principles you learned 
in those lessons have helped you avoid some common Solana exploits.

This unit is meant to build on top of that lesson with two main goals:

1. To expand your understanding of the Solana programming model and the areas where you need to 
   focus to close security loopholes in your programs.
2. To show you the set of tools provided by Anchor to help you keep your programs secure.

If you went through the Basic Security lesson, the first few lessons should feel familiar as they 
largely cover topics we've discussed before. After that, some of the attacks may seem new to you. 
We encourage you to go through all of them.

One last thing to note is that there are more lessons in this course than in prior ones. 
Since the lessons aren't as dependent on each other, you can explore them in any order you prefer.

Originally, we intended to have shorter lessons in this course. While they might be slightly 
shorter than average, they are still comprehensive. Even though each security vulnerability 
is "simple," there is a lot to discuss. As a result, each lesson might have less prose and more 
code snippets, making it easier for readers to choose how deeply they want to dive in. 
However, each lesson is still fully developed so that you can thoroughly grasp each of the 
discussed security risks.

As always, we appreciate your feedback. Good luck diving in!
