import { Message, MessageRepository } from "./post-message.usecase";

export class InMemoryMessageRepository implements MessageRepository {
  message: Message;
  save(msg: Message): void {
    this.message = msg;
  }
}
