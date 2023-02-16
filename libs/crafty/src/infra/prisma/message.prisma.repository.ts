import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MessageRepository } from '../../application/message.repository';
import { Message } from '../../domain/message';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(message: Message): Promise<void> {
    const messageData = message.data;
    await this.prisma.user.upsert({
      where: { name: messageData.author },
      update: { name: messageData.author },
      create: { name: messageData.author },
    });
    await this.prisma.message.upsert({
      where: { id: messageData.id },
      update: {
        id: messageData.id,
        text: messageData.text,
        authorId: messageData.author,
        publishedAt: messageData.publishedAt,
      },
      create: {
        id: messageData.id,
        text: messageData.text,
        authorId: messageData.author,
        publishedAt: messageData.publishedAt,
      },
    });
  }

  async getById(messageId: string): Promise<Message> {
    const messageData = await this.prisma.message.findFirstOrThrow({
      where: { id: messageId },
    });

    return Message.fromData({
      id: messageData.id,
      author: messageData.authorId,
      text: messageData.text,
      publishedAt: messageData.publishedAt,
    });
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messagesData = await this.prisma.message.findMany({
      where: { authorId: user },
    });

    return messagesData.map((m) =>
      Message.fromData({
        id: m.id,
        author: m.authorId,
        text: m.text,
        publishedAt: m.publishedAt,
      }),
    );
  }
}
