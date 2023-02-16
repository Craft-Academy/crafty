import { CraftyModule } from '@crafty/crafty';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/prisma/followee.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infra/prisma/message.prisma.repository';
import { PrismaService } from '@crafty/crafty/infra/prisma/prisma.service';
import { RealDateProvider } from '@crafty/crafty/infra/real-date-provider';
import { Module } from '@nestjs/common';
import { CliTimelinePresenter } from './cli.timeline.presenter';
import { commands } from './commands';
import { CustomConsoleLogger } from './custom.console.logger';
import { DefaultTimelinePresenter } from './default.timeline.presenter';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FolloweeRepository: PrismaFolloweeRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  providers: [
    ...commands,
    CliTimelinePresenter,
    CustomConsoleLogger,
    DefaultTimelinePresenter,
  ],
})
export class CliModule {}
