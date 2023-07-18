type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

type Option<T> = Some<T> | None;

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type SimpleNotFound = { notFound: true };
