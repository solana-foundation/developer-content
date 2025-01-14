---
title: Основні концепції
sidebarSortOrder: 2
description:
  Дізнайтеся про основні концепції блокчейну Solana, включаючи облікові записи, транзакції, програми, адреси, отримані від програм, міжпрограмні виклики та як працюють токени на Solana.
---

Розвивайте глибоке розуміння основних концепцій, які роблять Solana унікальним серед інших блокчейнів. Розуміння "моделі програмування Solana" через ці ключові концепції дуже важливе для максимального успіху як розробника блокчейну Solana.

## Модель облікових записів Solana

У Solana всі дані зберігаються в тому, що називається "обліковими записами". Організація даних у блокчейні Solana нагадує [сховище ключів і значень](https://uk.wikipedia.org/wiki/Key%E2%80%93value_%D0%B1%D0%B0%D0%B7%D0%B0_%D0%B4%D0%B0%D0%BD%D0%B8%D1%85), де кожен запис у базі даних називається "обліковим записом".

Дізнайтеся більше про [Облікові записи](/docs/core/accounts.md) тут.

## Транзакції та інструкції

У Solana ми надсилаємо [транзакції](/docs/core/transactions#transaction), щоб взаємодіяти з мережею. Транзакції включають одну або більше [інструкцій](/docs/core/transactions#instruction), кожна з яких представляє конкретну операцію для обробки. Логіка виконання інструкцій зберігається в [програмах](/docs/core/programs), розгорнутих у мережі Solana, де кожна програма має свій власний набір інструкцій.

Дізнайтеся більше про [Транзакції](/docs/core/transactions.md) та [Інструкції](/docs/core/transactions.md#instruction) тут.

## Плата на Solana

Блокчейн Solana має кілька типів зборів та витрат, які виникають при використанні мережі без дозволу. Вони поділяються на кілька основних типів:

- [Транзакційні збори](/docs/core/fees.md#transaction-fees) — плата за обробку транзакцій/інструкцій валідаторами.
- [Пріоритизаційні збори](/docs/core/fees.md#prioritization-fees) — опціональна плата для підвищення порядку обробки транзакцій.
- [Оренда](/docs/core/fees.md#rent) — утримуваний баланс для збереження даних в ончейні.

Дізнайтеся більше про [Плату на Solana](/docs/core/fees.md) тут.

## Програми на Solana

У екосистемі Solana "смарт-контракти" називаються програмами. Кожна програма є ончейн-обліковим записом, що зберігає виконувану логіку, організовану у функції, що називаються _інструкціями_, і викликаються через функції обробників інструкцій у відповідній розгорнутій програмі.

Дізнайтеся більше про [Програми на Solana](/docs/core/programs.md) тут.

## Адреси, отримані від програм

Адреси, отримані від програм (Program Derived Addresses, PDAs), надають розробникам Solana дві основні можливості:

- **Детерміновані адреси облікових записів**: PDAs забезпечують механізм детермінованого отримання адреси за допомогою комбінації опціональних "насіння" (заданих вхідних даних) і конкретного ідентифікатора програми.
- **Дозволити підписання програмою**: Час виконання Solana дозволяє програмам "підписувати" PDAs, які отримані від їх ідентифікатора програми.

Можна уявити PDAs як спосіб створення ончейн-структур, схожих на хеш-таблиці, з набору заданих вхідних даних (наприклад, рядків, чисел та інших адрес облікових записів).

Дізнайтеся більше про [Адреси, отримані від програм](/docs/core/pda.md) тут.

## Міжпрограмні виклики

Міжпрограмний виклик (Cross Program Invocation, CPI) означає, що одна програма викликає інструкції іншої програми. Цей механізм дозволяє програмам Solana бути композитивними.

Можна уявити інструкції як API-ендпоінти, які програма надає мережі, а CPI як один API, що викликає інший API внутрішньо.

Дізнайтеся більше про [Міжпрограмні виклики](/docs/core/cpi.md) тут.

## Токени на Solana

Токени — це цифрові активи, які представляють право власності на різні категорії активів. Токенізація дозволяє оцифровувати права власності, виступаючи фундаментальним компонентом для управління як взаємозамінними, так і невзаємозамінними активами.

- Взаємозамінні токени представляють взаємозамінні та подільні активи одного типу і вартості (наприклад, USDC).
- Невзаємозамінні токени (NFT) представляють право власності на неподільні активи (наприклад, твори мистецтва).

Дізнайтеся більше про [Токени на Solana](/docs/core/tokens.md) тут.

## Кластери та кінцеві точки

Блокчейн Solana має кілька різних груп валідаторів, відомих як [Кластери](/docs/core/clusters.md). Кожна з них виконує різні завдання в екосистемі та має спеціалізовані вузли API для виконання запитів [JSON-RPC](/docs/rpc/index.mdx) для свого кластеру.

Індивідуальні вузли в кластері належать і управляються третіми сторонами, причому для кожного з них доступна публічна кінцева точка.

Є три основні кластери в мережі Solana, кожен з яких має свою публічну кінцеву точку:

- Mainnet - `https://api.mainnet-beta.solana.com`
- Devnet - `https://api.devnet.solana.com`
- Testnet - `https://api.testnet.solana.com`

Дізнайтеся більше про [Кластери та кінцеві точки](/docs/core/clusters.md) тут.
