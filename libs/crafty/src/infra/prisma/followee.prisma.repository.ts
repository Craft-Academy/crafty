import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  Followee,
  FolloweeRepository,
} from '../../application/followee.repository';

@Injectable()
export class PrismaFolloweeRepository implements FolloweeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveFollowee(followee: Followee): Promise<void> {
    await this.upsertUser(followee.user);
    await this.upsertUser(followee.followee);
    await this.prisma.user.update({
      where: { name: followee.user },
      data: {
        following: {
          connectOrCreate: [
            {
              where: { name: followee.followee },
              create: { name: followee.followee },
            },
          ],
        },
      },
    });
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    const theUser = await this.prisma.user.findFirstOrThrow({
      where: { name: user },
      include: { following: true },
    });

    return theUser.following.map((f) => f.name);
  }

  private async upsertUser(user: string) {
    await this.prisma.user.upsert({
      where: { name: user },
      update: {
        name: user,
      },
      create: {
        name: user,
      },
    });
  }
}
