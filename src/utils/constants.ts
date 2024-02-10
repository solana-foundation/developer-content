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
