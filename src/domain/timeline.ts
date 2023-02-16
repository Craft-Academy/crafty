import { Message } from "./message";

const ONE_MINUTE_IN_MS = 60000;

export class Timeline {
  constructor(
    private readonly messages: Message[],
    private readonly now: Date
  ) {}

  get data() {
    this.messages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );

    return this.messages.map((msg) => ({
      author: msg.author,
      text: msg.text,
      publicationTime: this.publicationTime(msg.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date) {
    const diff = this.now.getTime() - publishedAt.getTime();
    const minutes = Math.floor(diff / ONE_MINUTE_IN_MS);
    if (minutes < 1) {
      return "less than a minute ago";
    }
    if (minutes < 2) {
      return "1 minute ago";
    }

    return `${minutes} minutes ago`;
  }
}
