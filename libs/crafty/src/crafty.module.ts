import { ClassProvider, DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DateProvider } from './application/date-provider';
import { FolloweeRepository } from './application/followee.repository';
import { MessageRepository } from './application/message.repository';
import { EditMessageUseCase } from './application/usecases/edit-message.usecase';
import { FollowUserUseCase } from './application/usecases/follow-user.usecase';
import { PostMessageUseCase } from './application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from './application/usecases/view-timeline.usecase';
import { ViewWallUseCase } from './application/usecases/view-wall.usecase';
import { DefaultTimelinePresenter } from './apps/timeline.default.presenter';

@Module({})
export class CraftyModule {
  static register(providers: {
    MessageRepository: ClassProvider<MessageRepository>['useClass'];
    FolloweeRepository: ClassProvider<FolloweeRepository>['useClass'];
    DateProvider: ClassProvider<DateProvider>['useClass'];
    PrismaClient: ClassProvider<PrismaClient>['useClass'];
  }): DynamicModule {
    return {
      module: CraftyModule,
      providers: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
        {
          provide: MessageRepository,
          useClass: providers.MessageRepository,
        },
        {
          provide: FolloweeRepository,
          useClass: providers.FolloweeRepository,
        },
        {
          provide: DateProvider,
          useClass: providers.DateProvider,
        },
        {
          provide: PrismaClient,
          useClass: providers.PrismaClient,
        },
      ],
      exports: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
        DateProvider,
      ],
    };
  }
}
