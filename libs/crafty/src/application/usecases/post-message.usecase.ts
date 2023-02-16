import { Message } from '../../domain/message';
import { MessageRepository } from '../message.repository';
import { DateProvider } from '../date-provider';
import { Injectable } from '@nestjs/common';

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};

@Injectable()
export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async handle(postMessageCommand: PostMessageCommand) {
    await this.messageRepository.save(
      Message.fromData({
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: this.dateProvider.getNow(),
      }),
    );
  }
}
