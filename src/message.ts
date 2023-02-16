export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export type Message = {
  id: string;
  author: string;
  text: MessageText;
  publishedAt: Date;
};

export class MessageText {
  private constructor(readonly value: string) {}

  static of(text: string) {
    if (text.length > 280) {
      throw new MessageTooLongError();
    }
    if (text.trim().length === 0) {
      throw new EmptyMessageError();
    }

    return new MessageText(text);
  }
}
