---
date: Feb 25, 2024
seoTitle: "AI Chatbot and Solana: NextJS, Vercel AI SDK, and the Helius API"
title: Build an AI Chatbot To Read the Solana Blockchain with Helius
description:
  "API access to large multimodal models (LMMs) like GPT-4 gives Solana builders
  the opportunity to interact with the blockchain in new ways. In this tutorial,
  you will use Next.js, the Vercel AI SDK and Helius to do just that."
keywords:
  - AI
  - LMM
  - Next.js
difficulty: beginner
tags:
  - ai
  - nextjs
  - react
  - helius
---

API access to large multimodal models (LMMs) like GPT-4 gives Solana builders
the opportunity to interact with the blockchain in new ways. In this tutorial,
you will use Next.js, the Vercel AI SDK and Helius to do just that.

You will have the ability to add in an [OpenAI](https://platform.openai.com/)
API key that interacts with any available OpenAI model and use function calling
to run a fetch request that returns JSON data from the Solana blockchain that
the chatbot will reveal. You will leverage the Helius API to make this happen.
This unlocks a lot of potential for developers to use both artificial
intelligence and a blockchain like Solana to build new types of complex
applications.

<Callout type="info">

The [Vercel AI SDK](https://sdk.vercel.ai/docs) allows for the usage of a wide
range of open-source models by giving you access to model providers. This
exposes you to AI models from Langchain, Anthropic, Mistral, Hugging Face, and
more!

</Callout>

For the complete version of this app, clone the repo:
[here](https://github.com/solanacryptodev/nextjs-ai-chat)

## Requirements

Before we begin. You will need four accounts set up for:

1. Github: [https://github.com/](https://github.com/)
2. OpenAI: [https://platform.openai.com/](https://platform.openai.com/)
3. Helius: [https://helius.xyz/](https://helius.xyz/)
4. Vercel (only if deploying):[https://www.vercel.com](https://www.vercel.com)

Lastly, you will need a beginner-level understanding of IDEs, CLIs and GitHub.

<Callout type="info">

GitHub and Vercel are free to use. OpenAI will require a small deposit to use
its GPT API, but is otherwise free. Lastly, Helius offers a free tier with a
generous credit limit which is great for testing.

</Callout>

## Getting Started

The Vercel team offers a pretty extensive template for getting started that you
can find [here](https://vercel.com/templates/next.js/nextjs-ai-chatbot). You can
either deploy it to Vercel immediately by following the
`Early Deployment Method` below or fork it and deploy it later by following the
`Manual Method` below.

### Early Deployment Method

If you want to immediately deploy it to Vercel, then navigate to the template
linked above and click the button that says `deploy.` You must be logged into
both your GitHub and Vercel accounts, and you will go through a process to set
up your deployment.

The most important thing here is to add in your `OPENAI_API_KEY` under Configure
Project. You can find it on the OpenAI Platform website. You will still need to
add it to your project locally in the .env file as well. We won't be using any
of the other environment variables, so you can simply enter empty strings for
those `''`.

<Callout type="info">

This template offers a lot of options such as storage that go beyond this
tutorial. After reading this tutorial, I challenge you to also set up a KV
database (or another type of database) to fetch and update chat logs for users.
It is required to add for the early deployment, but we won't be using it.

</Callout>

Once this is complete, you will have a staging site with a url provided.
Continue below to the `Manual Method` and do everything except fork the
repository because that has already been handled for you by Vercel during your
deployment. You will still need to copy the project URL and clone it onto your
local machine, however.

### Manual Method

Begin by [forking the GitHub repository](https://github.com/vercel/ai-chatbot).
Then copy the forked project URL and in a CLI, git clone your project by
running...

```
git clone <your-project-url.git>
```

This allows for local development. Open the project in an IDE of your choice and
in the terminal run the command below in the root directory.

```
pnpm i
```

With the project now installed locally on your computer, rename the
`.env.example` file to `.env` and add the `OPENAI_API_KEY` to the renamed file.
In the CLI, now run...

```
next dev --turbo
```

You should now have the project running locally on `localhost:3000`

<Callout type="info">

Go ahead and create two new .env variables. NEXT_PUBLIC_HELIUS_MAINNET_KEY and
HELIUS_MAINNET_KEY. Both will be used later in the tutorial. Store your Helius
API keys here. If you deployed, you'll need to add these environment variables
to Vercel as well or the build will fail.

</Callout>

## Testing the API

Before we add function calling to read Solana chain data, we want to first test
our OpenAI API to make sure it's working. To do that, we're going to refactor
some code that we don't need for this tutorial and bypass the authentication
logic. You should see a button that says 'Login with GitHub' on the page you
have running locally.

In your IDE, navigate to `auth.ts` and copy the code below. On Line 37, you're
replacing the route so that you won't re-route to the sign-in page due to not
being authenticated.

```javascript
pages: {
  signIn: "/";
}
```

Reload your localhost and you should now see a chat box at the bottom! There
should also be a modal at the top that says `Welcome to Next.js AI Chatbot!`.
We're one step closer to communicating with an AI on our local computer! Now
navigate to `app > api > chat > route.ts` and comment out Lines 19-23.

```javascript
// if (!userId) {
//   return new Response('Unauthorized', {
//     status: 401
//   })
// }
```

You were still blocked from using the chat before, but now you will be able to
chat with the LMM. Further below you will see the object that controls which
model you can chat with. This is where you can pass in whichever model OpenAI
has available such as the newest `gpt-4-0125-preview`. Be aware that there is a
significant difference in token price between the formerly mentioned model and
`gpt-3.5-turbo`.

```javascript
const res = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages,
  temperature: 0.7,
  stream: true,
});
```

## Function Calling: AI + Helius = Solana Chat Data

Let's set up the function calling next so that we can read data from the Solana
blockchain. You'll need a Helius RPC API for this step. `@vercel/ai` gives us
the flexibility to decide whether we want to handle function calling on the
client-side or server-side. In a web3 application, both have their use cases.

Client-side function calling is great when you need to work with non-sensitive
data and/or interactions with wallets signing transactions. Server-side is ideal
when it's an operation you don't want exposed on the client and don't need to
interact with a browser wallet. Could be some dev wallet signing a transaction
on-chain for instance. This tutorial will show both, but know that in a real
application, both may not be needed.

### Client-Side Setup

First navigate to `component > ui > chat.tsx`. Between Lines 41 - 59 is where
we'll focus. The useChat utility is from `@vercel/ai` and is what allows the
streaming of chat messages to and from our AI provider. You'll need to add
`experimental_onFunctionCall` and pass in a handler that we will set up next.

<Callout type="info">

The useChat utility function is powerful and allows the passing in of any
client-side data you can think of that you may want to share with the AI model
you're using. Something to think about if you're planning on using this template
for an actual project in the future. The main thing here is to add
`experimental_onFunctionCall: functionCallHandler`. This callback triggers the
function itself and returns the client data that is then passed to the AI
provider via the chat API route.

</Callout>

```javascript
const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
  initialMessages,
  id,
  body: {
    id,
    previewToken,
  },
  experimental_onFunctionCall: functionCallHandler,
  onResponse(response) {
    if (response.status === 401) {
      toast.error(response.statusText);
    }
  },
  onFinish() {
    if (!path.includes("chat")) {
      window.history.pushState({}, "", `/chat/${id}`);
    }
  },
});
```

Now, in the `lib` directory, create a new typescript file called `chat.ts`. In
it, add this at the top...

`import { FunctionCallHandler, ChatRequest, nanoid } from "ai";`

Then add in the code below.

```javascript
export const functionCallHandler: FunctionCallHandler = async (
  chatMessages,
  functionCall
) => {
  if ( functionCall.name === 'get_token_name' ) {
    if ( functionCall.arguments ) {
      const parsedFunctionCallArguments: { code: string } = JSON.parse(
        functionCall.arguments,
      );

      console.log( 'parsedFunctionCallArguments', parsedFunctionCallArguments );
    }

    // const url = process.env.NEXT_PUBLIC_HELIUS_MAINNET_API as string

    const response = await fetch( url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( {
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
          displayOptions: {
            showFungible: true
          }
        },
      } ),
    } );
    const { result } = await response.json();

    const functionResponse: ChatRequest = {
      // messages: [
      //     ...chatMessages,
      //     {
      //         id: nanoid(),
      //         name: 'get_token_name',
      //         role: 'function' as const,
      //         content: JSON.stringify({
      //             tokenName: result!,
      //         }),
      //     },
      // ],
    };
    return functionResponse;
  }
};
```

<Callout type="info">

There were some issues formatting the code block above for this tutorial, so
you'll have to un-comment out the messages array within the return object and
the URL pointing to your Helius key in your .env file. You will also want to
filter out chat responses that return the object itself.

</Callout>

As you can see, this function uses the Helius RPC to fetch fungible asset data.
In this case, our AI will have all the data that is returned on the Jupiter
(JUP) token.

The only thing left to do is to return to `chat.tsx` and import the
functionCallHandler.

`import { functionCallHandler } from '@/lib/chat'`

There is one thing you have left to do which is covered in the server-side setup
below.

### Server-Side Setup

Navigate to `api > chat > route.ts`

If you're coming from the client-side setup, you only have to do two things. Add
the code block below underneath the openai constant on Line 11. You will need to
import the following below.

`import type { ChatCompletionCreateParams } from 'openai/resources/chat';`

```javascript
const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: 'get_token_name',
    description: 'Tell me the token name.',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'The token name.',
        },
      },
      required: ['format'],
    },
  },
];
```

Then add that functions constant to the `res` object like so...

```javascript
const res = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages,
  functions,
  temperature: 0.7,
  stream: true,
});
```

That's it! Now you may want to reload your localhost browser, but if you're
coming from the client-side setup, you will now get Solana blockchain data from
the AI! You did it! If you're looking for the server-side setup, then you'll
need everything in this subsection above, but also more, so it may be simpler to
copy the entire code block below.

```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: 'get_token_name',
    description: 'Tell me the token name.',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'The token name.',
        },
      },
      required: ['format'],
    },
  },
];

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    functions,
    temperature: 0.7,
    stream: true
  })

  // const url = process.env.HELIUS_MAINNET_KEY as string
  const response = await fetch( url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( {
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: {
        id: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        displayOptions: {
          showFungible: true
        }
      },
    } ),
  } );
  const { result } = await response.json();

  const stream = OpenAIStream(res, {
    experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages ) => {
      if ( name === 'get_token_name' ) {

        const tokenName = {
          tokenName: result,
        // context: vectorData!
      }

        const newMessages: CreateMessage[] = createFunctionCallMessages(tokenName);
        return openai.chat.completions.create({
          messages: [...messages, ...newMessages],
          stream: true,
          model: 'gpt-3.5-turbo',
        });
      }

      // ADD MORE FUNCTIONS HERE!
    },
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      // await kv.hmset(`chat:${id}`, payload)
      // await kv.zadd(`user:chat:${userId}`, {
      //   score: createdAt,
      //   member: `chat:${id}`
      // })
    },
  })

  return new StreamingTextResponse(stream)
}
```

This code block contains everything that was done on the client-side, only
without the function handler. You added the fetch to the server and return the
result inside the `experimental_onFunctionCall` callback.

Once this is added, without needing to do anything on the client-side, you can
simply reload your localhost. You can tell it is easy to add a wide range of
functions that do different things and the AI will be able to return that data
to any user!

<Callout type="info">

I commented out something called `vectorData!`. If you're planning on using a
vector database, this is where you'd pass the results from that DB. More on
vector databases below.

</Callout>

## Conclusion

This opens the door for numerous applications. You may want to experiment with
that client-side method and see if you can trigger a web wallet transaction
based on a chat prompt. This would give you the ability to have direct
AI-to-blockchain engagement!

Making applications that use both of these technologies shouldn't be difficult
to set up and thankfully, it isn't! This is scalable, and you can also easily
integrate a vector database such as Pinecone into a separate API route. A vector
DB unlocks AI features such as long-term memory, security protections, and AI
personalities - among other cool things.

<Callout type="info">

`Long-Term Memory:` what if whenever a user did something, you stored it in a
vector db and at some point in the applications lifecycle, a function is
triggered that gets that data from the vector db and passes it to the AI! The AI
would be able to go back and provide feedback based on what that user has done
in the past. This could also apply to blockchain data as well.

`Security Protections:` perhaps you want to tighten the types of responses that
the AI can provide to the end user? You could upload documents specifying what
you'd like it to avoid.

`AI Personality:` who doesn't like an AI with a little character?! This would be
great for role-playing or just giving the model some life.

</Callout>

Solana is the best protocol for Blockchain + AI applications we can make sure
it's the leader as well.
