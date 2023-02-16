export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export class Message {
  constructor(
    private readonly _id: string,
    private readonly _author: string,
    private _text: MessageText,
    private readonly _publishedAt: Date
  ) {}

  get id() {
    return this._id;
  }

  get author() {
    return this._author;
  }

  get publishedAt() {
    return this._publishedAt;
  }

  get text() {
    return this._text.value;
  }

  editText(text: string) {
    this._text = MessageText.of(text);
  }

  get data() {
    return {
      id: this.id,
      author: this.author,
      text: this.text,
      publishedAt: this._publishedAt,
    };
  }

  static fromData(data: Message["data"]) {
    return new Message(
      data.id,
      data.author,
      MessageText.of(data.text),
      data.publishedAt
    );
  }
}

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
