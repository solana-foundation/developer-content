# Maintainers

This doc serves to contains useful bits of information for the maintainers of
this this repo and the associated "developer content api".

## Translations

Translations are handled via the [Crowdin](https://solana.crowdin.com/)
platform. The content within this repo is in the default/base language of
English.

When content is uploaded to the Crowdin platform, it will be broken into small
strings where people that have access can perform translations. Crowdin has a
nice diff system that will help to alert translators/managers when the base
language content changes, allowing us all to better track and perform
translations.

### Crowdin configuration

The `crowdin.yml` file contains all the configuration needed for their platform.
This config file will be auto loaded by the crowdin cli when it performs any
operations.

> To authenticate request to the crowdin api, the env variable
> `CROWDIN_PERSONAL_TOKEN` must be defined. For local development, the crowdin
> cli will auto load the `.env` file to get this variable.

### Upload content for translation

Push all the English based content to the Crowdin platform to

```shell
yarn crowdin:upload
```

### Download the current translations

You can download the latest translations using the crowdin cli:

```shell
yarn crowdin:download
```

This will store all the translated content files inside the `i18n` directory,
which will then be loaded into the content api using `contentlayer`.

### Translations via CI/CD

When new commits are made to the `main` branch of this repo, the `deploy.yml`
GitHub action will perform the tasks for uploading and downloading the
translated content from Crowdin.

It will first upload all the new content in the base language (i.e. when a page
gets edited or newly created), then download all translations for all languages.
The `deploy` action will then continue to build the content api normally.
