/**
 * Upper case the first character of a string
 */
export function ucFirst(label: string) {
  return label.charAt(0).toLocaleUpperCase() + label.slice(1);
}
