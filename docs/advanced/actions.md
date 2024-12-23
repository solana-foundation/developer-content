---
sidebarLabel: "Actions and Blinks"
title: "Actions and Blinks"
seoTitle: "Actions and Blinks"
description:
  "Solana Actions are APIs that return transactions for users to preview and
  sign. Blockchain links – or blinks – turn Actions into a shareable,
  metadata-rich link."
altRoutes:
  - /docs/actions
  - /docs/blinks
  - /docs/advanced/blinks
---

[Solana Actions](#actions) are specification-compliant APIs that return
transactions on the Solana blockchain to be previewed, signed, and sent across a
number of various contexts, including QR codes, buttons + widgets, and websites
across the internet. Actions make it simple for developers to integrate the
things you can do throughout the Solana ecosystem right into your environment,
allowing you to perform blockchain transactions without needing to navigate away
to a different app or webpage.

[Blockchain links](#blinks) – or blinks – turn any Solana Action into a
shareable, metadata-rich link. Blinks allow Action-aware clients (browser
extension wallets, bots) to display additional capabilities for the user. On a
website, a blink might immediately trigger a transaction preview in a wallet
without going to a decentralized app; in Discord, a bot might expand the blink
into an interactive set of buttons. This pushes the ability to interact on-chain
to any web surface capable of displaying a URL.

## Get Started

To quickly get started with creating custom Solana Actions:

```shell
npm install @solana/actions
```

- install the
  [Solana Actions SDK](https://www.npmjs.com/package/@solana/actions) in your
  application
- build an API endpoint for the [GET request](#get-request) that returns the
  metadata about your Action
- create an API endpoint that accepts the [POST request](#post-request) and
  returns the signable transaction for the user

> Checkout this video tutorial on
> [how to build a Solana Action](https://www.youtube.com/watch?v=kCht01Ycif0)
> using the `@solana/actions` SDK.
>
> You can also find the
> [source code for an Action](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts)
> that performs a native SOL transfer here and several other example Actions in
> [this repo](https://github.com/solana-developers/solana-actions/tree/main/examples).

When deploying your custom Solana Actions to production:

- ensure your application has a valid [actions.json file](#actionsjson) at the
  root of your domain
- ensure your application responds with the
  [required Cross-Origin headers](#options-response) on all Action endpoints,
  including the `actions.json` file
- test and debug your blinks/actions using the
  [Blinks Inspector](https://www.blinks.xyz/inspector)

If you are looking for inspiration around building Actions and blinks, checkout
the [Awesome Blinks](https://github.com/solana-developers/awesome-blinks)
repository for some community creations and even
[ideas for new ones](https://github.com/solana-developers/awesome-blinks/discussions/categories/ideas-for-blinks).

## Actions

The Solana Actions specification uses a set of standard APIs to deliver signable
transactions (and eventually signable messages) from an application directly to
a user. They are hosted at publicly accessible URLs and are therefore accessible
by their URL for any client to interact with.

> You can think of Actions as a API endpoint that will return metadata and
> something for a user to sign (either a transaction or a authentication
> message) with their blockchain wallet.

The Actions API consists of making simple `GET` and `POST` requests to an
Action's URL endpoint and handling the responses that conform to the Actions
interface.

1. the [GET request](#get-request) returns metadata that provides human-readable
   information to the client about what actions are available at this URL, and
   an optional list of related actions.
2. the [POST request](#post-request) returns a signable transaction or message
   that the client then prompts the user's wallet to sign and execute on the
   blockchain or in another offchain service.

### Action Execution and Lifecycle

In practice, interacting with Actions closely resembles interacting with a
typical REST API:

- a client makes the initial `GET` request to an Action URL in order to fetch
  metadata about the Actions available
- the endpoint returns a response that include metadata about the endpoint (like
  the application's title and icon) and a listing of the available actions for
  this endpoint
- the client application (like a mobile wallet, chat bot, or website) displays a
  UI for the user to perform one of the actions
- after the user selects an action (by clicking a button), the client makes a
  `POST` request to the endpoint in order to get the transaction for the user to
  sign
- the wallet facilitates the user signing the transaction and ultimately sends
  the transaction to the blockchain for confirmation

![Solana Actions Execution and Lifecycle](/public/assets/docs/action-execution-and-lifecycle.png)

When receiving transactions from an Actions URL, clients should handle
submission of these transactions to the blockchain and manage their state
lifecycle.

Actions also support some level of invalidation before execution. The `GET` and
`POST` request may return some metadata that states whether the action is
capable of be taken (like with the `disabled` field).

For example, if there was an Action endpoint that facilitates voting on a DAO
governance proposal whose voting window has closed, the initial
[GET request](#get-request) may return the error message "This proposal is no
longer up for a vote" and the "Vote Yes" and "Vote No" buttons as "disabled".

## Blinks

Blinks (blockchain links) are client applications that introspect Action APIs
and construct user interfaces around interacting with and executing Actions.

Client applications that support blinks simply detect Action-compatible URLs,
parse them, and allow users to interact with them in standardized user
interfaces.

> Any client application that fully introspects an Actions API to build a
> complete interface for it is a _blink_. Therefore, not all clients that
> consume Actions APIs are blinks.

### Blink URL Specification

A blink URL describes a client application that enables a user to complete the
full [lifecycle of executing an Action](#action-execution-and-lifecycle),
including signing with their wallet.

```text
https://example.domain/?action=<action_url>
```

For any client application to become a blink:

- The blink URL must contain a query parameter of `action` whose value is a
  URL-encoded [Action URL](#url-scheme). This value must be
  [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
  to not conflict with any other protocol parameters.

- The client application must
  [URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent)
  the `action` query parameter and introspect the Action API link provided (see
  [Action URL scheme](#url-scheme)).

- The client must render a rich user interface that enables a user to complete
  the full [lifecycle of executing an Action](#action-execution-and-lifecycle),
  including signing with their wallet.

> Not all blink client applications (e.g. websites or dApps) will support all
> Actions. Application developers may chose which Actions they want to support
> within their blink interfaces.

The following example demonstrates a valid blink URL with an `action` value of
`solana-action:https://actions.alice.com/donate` that is URL encoded:

```text
https://example.domain/?action=solana-action%3Ahttps%3A%2F%2Factions.alice.com%2Fdonate
```

### Detecting Actions via Blinks

Blinks may be linked to Actions in at least 3 ways:

1. Sharing an explicit Action URL:
   `solana-action:https://actions.alice.com/donate`

   In this case, only supported clients may render the blink. There will be no
   fallback link preview, or site that may be visited outside of the
   non-supporting client.

2. Sharing a link to a website that is linked to an Actions API via an
   [`actions.json` file](#actionsjson) on the website's domain root.

   For example, `https://alice.com/actions.json` maps
   `https://alice.com/donate`, a website URL at which users can donate to Alice,
   to API URL `https://actions.alice.com/donate`, at which Actions for donating
   to Alice are hosted.

3. Embedding an Action URL in an “interstitial” site URL that understands how to
   parse Actions.

   ```text
   https://example.domain/?action=<action_url>
   ```

Clients that support blinks should be able to take any of the above formats and
correctly render an interface to facilitate executing the action directly in the
client.

For clients that do not support blinks, there should be an underlying website
(making the browser become the universal fallback).

If a user taps anywhere on a client that is not an action button or text input
field, they should be taken to the underlying site.

### Blink Testing and Verification

While Solana Actions and blinks are a permissionless protocol/specification,
client applications and wallets are still required to ultimately facilitate
users to sign the transaction.

> Use the [Blinks Inspector](https://www.blinks.xyz/inspector) tool to inspect,
> debug, and test your blinks and actions directly in your browser. You can view
> the GET and POST response payloads, response headers, and test all inputs to
> each of your linked Actions.

Each client application or wallets may have different requirements on which
Action endpoints their clients will automatically unfurl and immediately display
to their users on social media platforms.

For example, some clients may operate on an "allow list" approach that may
require verification prior to their client unfurling an Action for users such as
Dialect's Actions Registry (detailed below).

All blinks will still render and allow for signing on Dialect's
[dial.to](https://dial.to) blinks Interstitial site, with their registry status
displayed in the blink.

### Dialect's Actions Registry

As a public good for the Solana ecosystem, [Dialect](https://dialect.to)
maintains a public registry — together with the help of Solana Foundation and
other community members — of blockchain links that have are from pre-verified
from known sources. As of launch, only Actions that have been registered in the
Dialect registry will unfurl in the Twitter feed when posted.

Client applications and wallets can freely choose to use this public registry or
another solution to help ensure user security and safety. If not verified
through the Dialect registry, the blockchain link will not be touched by the
blink client, and will be rendered as a typical URL.

Developers can apply to be verified by Dialect here:
[dial.to/register](https://dial.to/register)

## Specification

The Solana Actions specification consists of key sections that are part of a
request/response interaction flow:

- Solana Action [URL scheme](#url-scheme) providing an Action URL
- [OPTIONS response](#options-response) to an Action URL to pass CORS
  requirements
- [GET request](#get-request) to an Action URL
- [GET response](#get-response) from the server
- [POST request](#post-request) to an Action URL
- [POST response](#post-response) from the server

Each of these requests are made by the _Action client_ (e.g. wallet app, browser
extension, dApp, website, etc) to gather specific metadata for rich user
interfaces and to facilitate user input to the Actions API.

Each of the responses are crafted by an application (e.g. website, server
backend, etc) and returned to the _Action client_. Ultimately, providing a
signable transaction or message for a wallet to prompt the user to approve,
sign, and send to the blockchain.

> The types and interfaces declared within this readme files are often the
> simplified version of the types to aid in readability.
>
> For better type safety and improved developer experience, the
> `@solana/actions-spec` package contains more complex type definitions. You can
> find the
> [source code for them here](https://github.com/solana-developers/solana-actions/blob/main/packages/actions-spec/index.d.ts).

### URL Scheme

A Solana Action URL describes an interactive request for a signable Solana
transaction or message using the `solana-action` protocol.

The request is interactive because the parameters in the URL are used by a
client to make a series of standardized HTTP requests to compose a signable
transaction or message for the user to sign with their wallet.

```text
solana-action:<link>
```

- A single `link` field is required as the pathname. The value must be a
  conditionally
  [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
  absolute HTTPS URL.

- If the URL contains query parameters, it must be URL-encoded. URL-encoding the
  value prevents conflicting with any Actions protocol parameters, which may be
  added via the protocol specification.

- If the URL does not contain query parameters, it should not be URL-encoded.
  This produces a shorter URL and a less dense QR code.

In either case, clients must
[URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent)
the value. This has no effect if the value isn't URL-encoded. If the decoded
value is not an absolute HTTPS URL, the wallet must reject it as **malformed**.

### OPTIONS response

In order to allow Cross-Origin Resource Sharing
([CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)) within Actions
clients (including blinks), all Action endpoints should respond to HTTP requests
for the `OPTIONS` method with valid headers that will allow clients to pass CORS
checks for all subsequent requests from their same origin domain.

An Actions client may perform
"[preflight](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests)"
requests to the Action URL endpoint in order check if the subsequent GET request
to the Action URL will pass all CORS checks. These CORS preflight checks are
made using the `OPTIONS` HTTP method and should respond with all required HTTP
headers that will allow Action clients (like blinks) to properly make all
subsequent requests from their origin domain.

At a minimum, the required HTTP headers include:

- `Access-Control-Allow-Origin` with a value of `*`
  - this ensures all Action clients can safely pass CORS checks in order to make
    all required requests
- `Access-Control-Allow-Methods` with a value of `GET,POST,PUT,OPTIONS`
  - ensures all required HTTP request methods are supported for Actions
- `Access-Control-Allow-Headers` with a minimum value of
  `Content-Type, Authorization, Content-Encoding, Accept-Encoding`

For simplicity, developers should consider returning the same response and
headers to `OPTIONS` requests as their [`GET` response](#get-response).

<Callout type="caution" title="Cross-Origin headers for actions.json">

The `actions.json` file response must also return valid Cross-Origin headers for
`GET` and `OPTIONS` requests, specifically the `Access-Control-Allow-Origin`
header value of `*`.

See [actions.json](#actionsjson) below for more details.

</Callout>

### GET Request

The Action client (e.g. wallet, browser extension, etc) should make an HTTP
`GET` JSON request to the Action's URL endpoint.

- The request should not identify the wallet or the user.
- The client should make the request with an
  [`Accept-Encoding` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding).
- The client should display the domain of the URL as the request is being made.

### GET Response

The Action's URL endpoint (e.g. application or server backend) should respond
with an HTTP `OK` JSON response (with a valid payload in the body) or an
appropriate HTTP error.

- The client must handle HTTP
  [client errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses),
  [server errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses),
  and
  [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages).
- The endpoint should respond with a
  [`Content-Encoding` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)
  for HTTP compression.
- The endpoint should respond with a
  [`Content-Type` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
  of `application/json`.

- The client should not cache the response except as instructed by
  [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching)
  response headers.
- The client should display the `title` and render the `icon` image to user.

Error responses (i.e. HTTP 4xx and 5xx status codes) should return a JSON
response body following `ActionError` to present a helpful error message to
users. See [Action Errors](#action-errors).

#### GET Response Body

A `GET` response with an HTTP `OK` JSON response should include a body payload
that follows the interface specification:

```ts filename="ActionGetResponse"
export type ActionType = "action" | "completed";

export type ActionGetResponse = Action<"action">;

export interface Action<T extends ActionType> {
  /** type of Action to present to the user */
  type: T;
  /** image url that represents the source of the action request */
  icon: string;
  /** describes the source of the action request */
  title: string;
  /** brief summary of the action to be performed */
  description: string;
  /** button text rendered to the user */
  label: string;
  /** UI state for the button being rendered to the user */
  disabled?: boolean;
  links?: {
    /** list of related Actions a user could perform */
    actions: LinkedAction[];
  };
  /** non-fatal error message to be displayed to the user */
  error?: ActionError;
}
```

- `type` - The type of action being given to the user. Defaults to `action`. The
  initial `ActionGetResponse` is required to have a type of `action`.

  - `action` - Standard action that will allow the user to interact with any of
    the `LinkedActions`
  - `completed` - Used to declare the "completed" state within action chaining.

- `icon` - The value must be an absolute HTTP or HTTPS URL of an icon image. The
  file must be an SVG, PNG, or WebP image, or the client/wallet must reject it
  as **malformed**.

- `title` - The value must be a UTF-8 string that represents the source of the
  action request. For example, this might be the name of a brand, store,
  application, or person making the request.

- `description` - The value must be a UTF-8 string that provides information on
  the action. The description should be displayed to the user.

- `label` - The value must be a UTF-8 string that will be rendered on a button
  for the user to click. All labels should not exceed 5 word phrases and should
  start with a verb to solidify the action you want the user to take. For
  example, "Mint NFT", "Vote Yes", or "Stake 1 SOL".

- `disabled` - The value must be boolean to represent the disabled state of the
  rendered button (which displays the `label` string). If no value is provided,
  `disabled` should default to `false` (i.e. enabled by default). For example,
  if the action endpoint is for a governance vote that has closed, set
  `disabled=true` and the `label` could be "Vote Closed".

- `error` - An optional error indication for non-fatal errors. If present, the
  client should display it to the user. If set, it should not prevent the client
  from interpreting the action or displaying it to the user (see
  [Action Errors](#action-errors)). For example, the error can be used together
  with `disabled` to display a reason like business constraints, authorization,
  the state, or an error of external resource.

- `links.actions` - An optional array of related actions for the endpoint. Users
  should be displayed UI for each of the listed actions and expected to only
  perform one. For example, a governance vote action endpoint may return three
  options for the user: "Vote Yes", "Vote No", and "Abstain from Vote".

  - If no `links.actions` is provided, the client should render a single button
    using the root `label` string and make the POST request to the same action
    URL endpoint as the initial GET request.

  - If any `links.actions` are provided, the client should only render buttons
    and input fields based on the items listed in the `links.actions` field. The
    client should not render a button for the contents of the root `label`.

```ts filename="LinkedAction"
export interface LinkedAction {
  /** URL endpoint for an action */
  href: string;
  /** button text rendered to the user */
  label: string;
  /**
   * Parameters to accept user input within an action
   * @see {ActionParameter}
   * @see {ActionParameterSelectable}
   */
  parameters?: Array<TypedActionParameter>;
}
```

The `ActionParameter` allows declaring what input the Action API is requesting
from the user:

```ts filename="ActionParameter"
/**
 * Parameter to accept user input within an action
 * note: for ease of reading, this is a simplified type of the actual
 */
export interface ActionParameter {
  /** input field type */
  type?: ActionParameterType;
  /** parameter name in url */
  name: string;
  /** placeholder text for the user input field */
  label?: string;
  /** declare if this field is required (defaults to `false`) */
  required?: boolean;
  /** regular expression pattern to validate user input client side */
  pattern?: string;
  /** human-readable description of the `type` and/or `pattern`, represents a caption and error, if value doesn't match */
  patternDescription?: string;
  /** the minimum value allowed based on the `type` */
  min?: string | number;
  /** the maximum value allowed based on the `type` */
  max?: string | number;
}
```

The `pattern` should be a string equivalent of a valid regular expression. This
regular expression pattern should by used by blink-clients to validate user
input before making the POST request. If the `pattern` is not a valid regular
expression, it should be ignored by clients.

The `patternDescription` is a human readable description of the expected input
requests from the user. If `pattern` is provided, the `patternDescription` is
required to be provided.

The `min` and `max` values allows the input to set a lower and/or upper bounds
of the input requested from the user (i.e. min/max number and or min/max
character length), and should be used for client side validation. For input
`type`s of `date` or `datetime-local`, these values should be a string dates.
For other string based input `type`s, the values should be numbers representing
their min/max character length.

If the user input value is not considered valid per the `pattern`, the user
should receive a client side error message indicating the input field is not
valid and displayed the `patternDescription` string.

The `type` field allows the Action API to declare more specific user input
fields, providing better client side validation and improving the user
experience. In many cases, this type will resemble the standard
[HTML input element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).

The `ActionParameterType` can be simplified to the following type:

```ts filename="ActionParameterType"
/**
 * Input field type to present to the user
 * @default `text`
 */
export type ActionParameterType =
  | "text"
  | "email"
  | "url"
  | "number"
  | "date"
  | "datetime-local"
  | "checkbox"
  | "radio"
  | "textarea"
  | "select";
```

Each of the `type` values should normally result in a user input field that
resembles a standard HTML `input` element of the corresponding `type` (i.e.
`<input type="email" />`) to provide better client side validation and user
experience:

- `text` - equivalent of HTML
  [“text” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text)
  element
- `email` - equivalent of HTML
  [“email” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email)
  element
- `url` - equivalent of HTML
  [“url” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/url)
  element
- `number` - equivalent of HTML
  [“number” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)
  element
- `date` - equivalent of HTML
  [“date” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date)
  element
- `datetime-local` - equivalent of HTML
  [“datetime-local” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local)
  element
- `checkbox` - equivalent to a grouping of standard HTML
  [“checkbox” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)
  elements. The Action API should return `options` as detailed below. The user
  should be able to select multiple of the provided checkbox options.
- `radio` - equivalent to a grouping of standard HTML
  [“radio” input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio)
  elements. The Action API should return `options` as detailed below. The user
  should be able to select only one of the provided radio options.
- Other HTML input type equivalents not specified above (`hidden`, `button`,
  `submit`, `file`, etc) are not supported at this time.

In addition to the elements resembling HTML input types above, the following
user input elements are also supported:

- `textarea` - equivalent of HTML
  [textarea element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea).
  Allowing the user to provide multi-line input.
- `select` - equivalent of HTML
  [select element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select),
  allowing the user to experience a “dropdown” style field. The Action API
  should return `options` as detailed below.

When `type` is set as `select`, `checkbox`, or `radio` then the Action API
should include an array of `options` that each provide a `label` and `value` at
a minimum. Each option may also have a `selected` value to inform the
blink-client which of the options should be selected by default for the user
(see `checkbox` and `radio` for differences).

This `ActionParameterSelectable` can be simplified to the following type
definition:

```ts filename="ActionParameterSelectable"
/**
 * note: for ease of reading, this is a simplified type of the actual
 */
interface ActionParameterSelectable extends ActionParameter {
  options: Array<{
    /** displayed UI label of this selectable option */
    label: string;
    /** value of this selectable option */
    value: string;
    /** whether or not this option should be selected by default */
    selected?: boolean;
  }>;
}
```

If no `type` is set or an unknown/unsupported value is set, blink-clients should
default to `text` and render a simple text input.

The Action API is still responsible to validate and sanitize all data from the
user input parameters, enforcing any “required” user input as necessary.

For platforms other that HTML/web based ones (like native mobile), the
equivalent native user input component should be used to achieve the equivalent
experience and client side validation as the HTML/web input types described
above.

#### Example GET Response

The following example response provides a single "root" action that is expected
to be presented to the user a single button with a label of "Claim Access
Token":

```json
{
  "title": "HackerHouse Events",
  "icon": "<url-to-image>",
  "description": "Claim your Hackerhouse access token.",
  "label": "Claim Access Token" // button text
}
```

The following example response provides 3 related action links that allow the
user to click one of 3 buttons to cast their vote for a DAO proposal:

```json
{
  "title": "Realms DAO Platform",
  "icon": "<url-to-image>",
  "description": "Vote on DAO governance proposals #1234.",
  "label": "Vote",
  "links": {
    "actions": [
      {
        "label": "Vote Yes", // button text
        "href": "/api/proposal/1234/vote?choice=yes"
      },
      {
        "label": "Vote No", // button text
        "href": "/api/proposal/1234/vote?choice=no"
      },
      {
        "label": "Abstain from Vote", // button text
        "href": "/api/proposal/1234/vote?choice=abstain"
      }
    ]
  }
}
```

#### Example GET Response with Parameters

The following examples response demonstrate how to accept text input from the
user (via `parameters`) and include that input in the final `POST` request
endpoint (via the `href` field within a `LinkedAction`):

The following example response provides the user with 3 linked actions to stake
SOL: a button labeled "Stake 1 SOL", another button labeled "Stake 5 SOL", and a
text input field that allows the user to enter a specific "amount" value that
will be sent to the Action API:

```json
{
  "title": "Stake-o-matic",
  "icon": "<url-to-image>",
  "description": "Stake SOL to help secure the Solana network.",
  "label": "Stake SOL", // not displayed since `links.actions` are provided
  "links": {
    "actions": [
      {
        "label": "Stake 1 SOL", // button text
        "href": "/api/stake?amount=1"
        // no `parameters` therefore not a text input field
      },
      {
        "label": "Stake 5 SOL", // button text
        "href": "/api/stake?amount=5"
        // no `parameters` therefore not a text input field
      },
      {
        "label": "Stake", // button text
        "href": "/api/stake?amount={amount}",
        "parameters": [
          {
            "name": "amount", // field name
            "label": "SOL amount" // text input placeholder
          }
        ]
      }
    ]
  }
}
```

The following example response provides a single input field for the user to
enter an `amount` which is sent with the POST request (either as a query
parameter or a subpath can be used):

```json
{
  "icon": "<url-to-image>",
  "label": "Donate SOL",
  "title": "Donate to GoodCause Charity",
  "description": "Help support this charity by donating SOL.",
  "links": {
    "actions": [
      {
        "label": "Donate", // button text
        "href": "/api/donate/{amount}", // or /api/donate?amount={amount}
        "parameters": [
          // {amount} input field
          {
            "name": "amount", // input field name
            "label": "SOL amount" // text input placeholder
          }
        ]
      }
    ]
  }
}
```

### POST Request

The client must make an HTTP `POST` JSON request to the action URL with a body
payload of:

```json
{
  "account": "<account>"
}
```

- `account` - The value must be the base58-encoded public key of an account that
  may sign the transaction.

The client should make the request with an
[Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding)
and the application may respond with a
[Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)
for HTTP compression.

The client should display the domain of the action URL as the request is being
made. If a `GET` request was made, the client should also display the `title`
and render the `icon` image from that GET response.

### POST Response

The Action's `POST` endpoint should respond with an HTTP `OK` JSON response
(with a valid payload in the body) or an appropriate HTTP error.

- The client must handle HTTP
  [client errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses),
  [server errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses),
  and
  [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages).
- The endpoint should respond with a
  [`Content-Type` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
  of `application/json`.

Error responses (i.e. HTTP 4xx and 5xx status codes) should return a JSON
response body following `ActionError` to present a helpful error message to
users. See [Action Errors](#action-errors).

#### POST Response Body

A `POST` response with an HTTP `OK` JSON response should include a body payload
of:

```ts filename="ActionPostResponse"
/**
 * Response body payload returned from the Action POST Request
 */
export interface ActionPostResponse<T extends ActionType = ActionType> {
  /** base64 encoded serialized transaction */
  transaction: string;
  /** describes the nature of the transaction */
  message?: string;
  links?: {
    /**
     * The next action in a successive chain of actions to be obtained after
     * the previous was successful.
     */
    next: NextActionLink;
  };
}
```

- `transaction` - The value must be a base64-encoded
  [serialized transaction](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#serialize).
  The client must base64-decode the transaction and
  [deserialize it](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#from).

- `message` - The value must be a UTF-8 string that describes the nature of the
  transaction included in the response. The client should display this value to
  the user. For example, this might be the name of an item being purchased, a
  discount applied to a purchase, or a thank you note.

- `links.next` - An optional value use to "chain" multiple Actions together in
  series. After the included `transaction` has been confirmed on-chain, the
  client can fetch and render the next action. See
  [Action Chaining](#action-chaining) for more details.

- The client and application should allow additional fields in the request body
  and response body, which may be added by future specification updates.

> The application may respond with a partially or fully signed transaction. The
> client and wallet must validate the transaction as **untrusted**.

#### POST Response - Transaction

If the transaction
[`signatures`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#signatures)
are empty or the transaction has NOT been partially signed:

- The client must ignore the
  [`feePayer`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#feePayer)
  in the transaction and set the `feePayer` to the `account` in the request.
- The client must ignore the
  [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#recentBlockhash)
  in the transaction and set the `recentBlockhash` to the
  [latest blockhash](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Connection.html#getLatestBlockhash).
- The client must serialize and deserialize the transaction before signing it.
  This ensures consistent ordering of the account keys, as a workaround for
  [this issue](https://github.com/solana-labs/solana/issues/21722).

If the transaction has been partially signed:

- The client must NOT alter the
  [`feePayer`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#feePayer)
  or
  [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html#recentBlockhash)
  as this would invalidate any existing signatures.
- The client must verify existing signatures, and if any are invalid, the client
  must reject the transaction as **malformed**.

The client must only sign the transaction with the `account` in the request, and
must do so only if a signature for the `account` in the request is expected.

If any signature except a signature for the `account` in the request is
expected, the client must reject the transaction as **malicious**.

### Action Errors

Actions APIs should return errors using `ActionError` in order to present
helpful error messages to the user. Depending on the context, this error could
be fatal or non-fatal.

```ts filename="ActionError"
export interface ActionError {
  /** simple error message to be displayed to the user */
  message: string;
}
```

When an Actions API responds with an HTTP error status code (i.e. 4xx and 5xx),
the response body should be a JSON payload following `ActionError`. The error is
considered fatal and the included `message` should be presented to the user.

For API responses that support the optional `error` attribute (like
[`ActionGetResponse`](#get-response)), the error is considered non-fatal and the
included `message` should be presented to the user.

## Action Chaining

Solana Actions can be "chained" together in a successive series. After an
Action's transaction is confirmed on-chain, the next action can be obtained and
presented to the user.

Action chaining allows developers to build more complex and dynamic experiences
within blinks, including:

- providing multiple transactions (and eventually sign message) to a user
- customized action metadata based on the user's wallet address
- refreshing the blink metadata after a successful transaction
- receive an API callback with the transaction signature for additional
  validation and logic on the Action API server
- customized "success" messages by updating the displayed metadata (e.g. a new
  image and description)

To chain multiple actions together, in any `ActionPostResponse` include a
`links.next` of either:

- `PostNextActionLink` - POST request link with a same origin callback url to
  receive the `signature` and user's `account` in the body. This callback url
  should respond with a `NextAction`.
- `InlineNextActionLink` - Inline metadata for the next action to be presented
  to the user immediately after the transaction has confirmed. No callback will
  be made.

```ts
export type NextActionLink = PostNextActionLink | InlineNextActionLink;

/** @see {NextActionPostRequest} */
export interface PostNextActionLink {
  /** Indicates the type of the link. */
  type: "post";
  /** Relative or same origin URL to which the POST request should be made. */
  href: string;
}

/**
 * Represents an inline next action embedded within the current context.
 */
export interface InlineNextActionLink {
  /** Indicates the type of the link. */
  type: "inline";
  /** The next action to be performed */
  action: NextAction;
}
```

### NextAction

After the `ActionPostResponse` included `transaction` is signed by the user and
confirmed on-chain, the blink client should either:

- execute the callback request to fetch and display the `NextAction`, or
- if a `NextAction` is already provided via `links.next`, the blink client
  should update the displayed metadata and make no callback request

If the callback url is not the same origin as the initial POST request, no
callback request should be made. Blink clients should display an error notifying
the user.

```ts filename="NextAction"
/** The next action to be performed */
export type NextAction = Action<"action"> | CompletedAction;

/** The completed action, used to declare the "completed" state within action chaining. */
export type CompletedAction = Omit<Action<"completed">, "links">;
```

Based on the `type`, the next action should be presented to the user via blink
clients in one of the following ways:

- `action` - (default) A standard action that will allow the user to see the
  included Action metadata, interact with the provided `LinkedActions`, and
  continue to chain any following actions.

- `completed` - The terminal state of an action chain that can update the blink
  UI with the included Action metadata, but will not allow the user to execute
  further actions.

If `links.next` is not provided, blink clients should assume the current action
is final action in the chain, presenting their "completed" UI state after the
transaction is confirmed.

## actions.json

The purpose of the [`actions.json` file](#actionsjson) allows an application to
instruct clients on what website URLs support Solana Actions and provide a
mapping that can be used to perform [GET requests](#get-request) to an Actions
API server.

<Callout type="caution" title="Cross-Origin headers are required">

The `actions.json` file response must also return valid Cross-Origin headers for
`GET` and `OPTIONS` requests, specifically the `Access-Control-Allow-Origin`
header value of `*`.

See [OPTIONS response](#options-response) above for more details.

</Callout>

The `actions.json` file should be stored and universally accessible at the root
of the domain.

For example, if your web application is deployed to `my-site.com` then the
`actions.json` file should be accessible at `https://my-site.com/actions.json`.
This file should also be Cross-Origin accessible via any browser by having a
`Access-Control-Allow-Origin` header value of `*`.

### Rules

The `rules` field allows the application to map a set of a website's relative
route paths to a set of other paths.

**Type:** `Array` of `ActionRuleObject`.

```ts filename="ActionRuleObject"
interface ActionRuleObject {
  /** relative (preferred) or absolute path to perform the rule mapping from */
  pathPattern: string;
  /** relative (preferred) or absolute path that supports Action requests */
  apiPath: string;
}
```

- [`pathPattern`](#rules-pathpattern) - A pattern that matches each incoming
  pathname.

- [`apiPath`](#rules-apipath) - A location destination defined as an absolute
  pathname or external URL.

#### Rules - pathPattern

A pattern that matches each incoming pathname. It can be an absolute or relative
path and supports the following formats:

- **Exact Match**: Matches the exact URL path.

  - Example: `/exact-path`
  - Example: `https://website.com/exact-path`

- **Wildcard Match**: Uses wildcards to match any sequence of characters in the
  URL path. This can match single (using `*`) or multiple segments (using `**`).
  (see [Path Matching](#rules-path-matching) below).

  - Example: `/trade/*` will match `/trade/123` and `/trade/abc`, capturing only
    the first segment after `/trade/`.
  - Example: `/category/*/item/**` will match `/category/123/item/456` and
    `/category/abc/item/def`.
  - Example: `/api/actions/trade/*/confirm` will match
    `/api/actions/trade/123/confirm`.

#### Rules - apiPath

The destination path for the action request. It can be defined as an absolute
pathname or an external URL.

- Example: `/api/exact-path`
- Example: `https://api.example.com/v1/donate/*`
- Example: `/api/category/*/item/*`
- Example: `/api/swap/**`

#### Rules - Query Parameters

Query parameters from the original URL are always preserved and appended to the
mapped URL.

#### Rules - Path Matching

The following table outlines the syntax for path matching patterns:

| Operator | Matches                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*`      | A single path segment, not including the surrounding path separator / characters.                                                                                                        |
| `**`     | Matches zero or more characters, including any path separator / characters between multiple path segments. If other operators are included, the `**` operator must be the last operator. |
| `?`      | Unsupported pattern.                                                                                                                                                                     |

### Rules Examples

The following example demonstrates an exact match rule to map requests to `/buy`
from your site's root to the exact path `/api/buy` relative to your site's root:

```json filename="actions.json"
{
  "rules": [
    {
      "pathPattern": "/buy",
      "apiPath": "/api/buy"
    }
  ]
}
```

The following example uses wildcard path matching to map requests to any path
(excluding subdirectories) under `/actions/` from your site's root to a
corresponding path under `/api/actions/` relative to your site's root:

```json filename="actions.json"
{
  "rules": [
    {
      "pathPattern": "/actions/*",
      "apiPath": "/api/actions/*"
    }
  ]
}
```

The following example uses wildcard path matching to map requests to any path
(excluding subdirectories) under `/donate/` from your site's root to a
corresponding absolute path `https://api.dialect.com/api/v1/donate/` on an
external site:

```json filename="actions.json"
{
  "rules": [
    {
      "pathPattern": "/donate/*",
      "apiPath": "https://api.dialect.com/api/v1/donate/*"
    }
  ]
}
```

The following example uses wildcard path matching for an idempotent rule to map
requests to any path (including subdirectories) under `/api/actions/` from your
site's root to itself:

> Idempotent rules allow blink clients to more easily determine if a given path
> supports Action API requests without having to be prefixed with the
> `solana-action:` URI or performing additional response testing.

```json filename="actions.json"
{
  "rules": [
    {
      "pathPattern": "/api/actions/**",
      "apiPath": "/api/actions/**"
    }
  ]
}
```

## Action Identity

Action endpoints may include an _Action Identity_ in the transactions that are
returned in their [POST response](#post-response) for the user to sign. This
allows indexers and analytics platforms to easily and verifiably attribute
on-chain activity to a specific Action Provider (i.e. service) in a verifiable
way.

The [Action Identity](#action-identity) is a keypair used to sign a specially
formatted message that is included in transaction using a Memo instruction. This
_Identifier Message_ can be verifiably attributed to a specific Action Identity,
and therefore attribute transactions to a specific Action Provider.

The keypair is not required to sign the transaction itself. This allows wallets
and applications to improve transaction deliverability when no other signatures
are on the transaction returned to a user (see
[POST response transaction](#post-response-transaction)).

If an Action Provider's use case requires their backend services to pre-sign the
transaction before the user does, they should use this keypair as their Action
Identity. This will allow one less account be included in the transaction,
lowering the total transactions size by 32-bytes.

### Action Identifier Message

The Action Identifier Message is a colon separate UTF-8 string included in a
transaction using a single [SPL Memo](https://spl.solana.com/memo) instruction.

```shell
protocol:identity:reference:signature
```

- `protocol` - The value of the protocol being used (set to `solana-action` per
  the [URL Scheme](#url-scheme) above)
- `identity` - The value must be the base58-encoded public key address of the
  Action Identity keypair
- `reference` - The value must be base58-encoded 32-byte array. This may or may
  not be public keys, on or off the curve, and may or may not correspond with
  accounts on Solana.
- `signature` - base58-encoded signature created from the Action Identity
  keypair signing only the `reference` value.

The `reference` value must be used only once and in a single transaction. For
the purpose of associating transactions with an Action Provider, only the first
usage of the `reference` value is considered valid.

Transactions may have multiple Memo instructions. When performing a
[`getSignaturesForAddress`](https://solana.com/docs/rpc/http/getsignaturesforaddress),
the results `memo` field will return each memo instruction's message as a single
string with each separated by a semi-colon.

No other data should be included with Identifier Message's Memo instruction.

The `identity` and the `reference` should be included as read-only, non-signer
[keys](https://solana-labs.github.io/solana-web3.js/v1.x/classes/TransactionInstruction.html#keys)
in the transaction on an instruction that is NOT the Identifier Message Memo
instruction.

The Identifier Message Memo instruction must have zero accounts provided. If any
accounts are provided, the Memo program requires theses accounts to be valid
signers. For the purposes of identifying actions, this restricts flexibility and
can degrade the user experience. Therefore it is considered an anti-pattern and
must be avoided.

### Action Identity Verification

Any transaction that includes the `identity` account can be verifiably
associated with the Action Provider in a multi-step process:

1. Get all the transactions for a given `identity`.
2. Parse and verify each transaction's memo string, ensuring the `signature` is
   valid for the `reference` stored.
3. Verify the specific transaction is the first on-chain occurrence of the
   `reference` on-chain:
   - If this transaction is the first occurrence, the transaction is considered
     verified and can be safely attributed to the Action Provider.
   - If this transaction is NOT the first occurrence, it is considered invalid
     and therefore not attributed to the Action Provider.

Because Solana validators index transactions by the account keys, the
[`getSignaturesForAddress`](https://solana.com/docs/rpc/http/getsignaturesforaddress)
RPC method can be used locate all transactions including the `identity` account.

This RPC method's response includes all the Memo data in the `memo` field. If
multiple Memo instructions were used in the transaction, each memo message will
be included in this `memo` field and must be parsed accordingly by the verifier
to obtain the _Identity Verification Message_.

These transactions should be initially considered **UNVERIFIED**. This is due to
the `identity` not being required to sign the transaction which allows any
transaction to include this account as a non-signer. Potentially artificially
inflating attribution and usage counts.

The Identity Verification Message should be checked to ensure the `signature`
was created by the `identity` signing the `reference`. If this signature
verification fails, the transaction is invalid and should be attributed to the
Action Provider.

If the signature verification is successful, the verifier should ensure this
transaction is the first on-chain occurrence of the `reference`. If it is not,
the transaction is considered invalid.
