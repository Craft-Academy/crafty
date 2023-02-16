import { Message } from "./message";

export class Timeline {
  constructor(private readonly messages: Message[]) {}

  get data() {
    this.messages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );

    return this.messages.map((msg) => msg.data);
  }
}
