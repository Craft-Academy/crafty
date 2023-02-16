import { Injectable } from '@nestjs/common';
import { Message } from '../domain/message';

@Injectable()
export abstract class MessageRepository {
  abstract save(message: Message): Promise<void>;
  abstract getById(messageId: string): Promise<Message>;
  abstract getAllOfUser(user: string): Promise<Message[]>;
}
