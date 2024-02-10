/**
 * Default language locale to use for the content
 */
export const DEFAULT_LOCALE_EN = "en";

/**
 * Standard RegEx to parse a 2 character locale code
 */
export const LOCALE_REGEX = /^\w{2,2}$/gi;

/**
 * Regex to parse the i18n locale for content records
 */
export const I18N_LOCALE_REGEX = new RegExp(/^i18n\/(\w{2,2})\//i);

/**
 * Whether or not to include the `/i18n/{locale}` prefix on the contentlayer
 * computed `_id` and `_raw` attributes
 *
 * Generally, if the multi-locale content is committed to the repo
 * (i.e. downloaded via Crowdin at build time) this should be `true`.
 * if the locale content is NOT committed, this should be `false`
 */
export const I18N_INCLUDE_IN_PATHS = false;
