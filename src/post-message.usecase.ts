import { Message } from "./message";
import { MessageRepository } from "./message.repository";

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};

export interface DateProvider {
  getNow(): Date;
}

export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle(postMessageCommand: PostMessageCommand) {
    await this.messageRepository.save(
      Message.fromData({
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: this.dateProvider.getNow(),
      })
    );
  }
}
