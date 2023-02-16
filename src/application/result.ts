export type Result<T, E extends Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
  private constructor(public readonly value: T) {}

  static of<T, E>(value: T): Ok<T, E> {
    return new Ok(value);
  }

  public isOk(): this is Ok<T, E> {
    return true;
  }

  public isErr(): this is Err<T, E> {
    return false;
  }
}

export class Err<T, E> {
  private constructor(public readonly error: E) {}

  static of<T, E>(error: E): Err<T, E> {
    return new Err(error);
  }

  public isOk(): this is Ok<T, E> {
    return false;
  }

  public isErr(): this is Err<T, E> {
    return true;
  }
}
