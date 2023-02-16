import {
  EditMessageCommand,
  EditMessageUseCase,
} from '@crafty/crafty/application/usecases/edit-message.usecase';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '@crafty/crafty/application/usecases/follow-user.usecase';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '@crafty/crafty/application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/view-timeline.usecase';
import { ViewWallUseCase } from '@crafty/crafty/application/usecases/view-wall.usecase';
import { Command, CommandRunner } from 'nest-commander';
import { CliTimelinePresenter } from './cli.timeline.presenter';

@Command({ name: 'post', arguments: '<user> <message>' })
class PostCommand extends CommandRunner {
  constructor(private readonly postMessageUseCase: PostMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const postMessageCommand: PostMessageCommand = {
      id: Math.floor(Math.random() * 1000).toString(),
      author: passedParams[0],
      text: passedParams[1],
    };
    try {
      await this.postMessageUseCase.handle(postMessageCommand);
      console.log('✅ Message posté');
      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'edit', arguments: '<user> <message-id> <message>' })
class EditCommand extends CommandRunner {
  constructor(private readonly editMessageUseCase: EditMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const editMessageCommand: EditMessageCommand = {
      messageId: passedParams[1],
      text: passedParams[2],
    };
    try {
      await this.editMessageUseCase.handle(editMessageCommand);
      console.log('✅ Message edité');
      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'follow', arguments: '<user> <followee>' })
class FollowCommand extends CommandRunner {
  constructor(private readonly followUserUseCase: FollowUserUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const followUserCommand: FollowUserCommand = {
      user: passedParams[0],
      userToFollow: passedParams[1],
    };
    try {
      await this.followUserUseCase.handle(followUserCommand);
      console.log(`✅ Tu suis maintenant ${passedParams[1]}`);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'view', arguments: '<user>' })
class ViewCommand extends CommandRunner {
  constructor(
    private readonly cliPresenter: CliTimelinePresenter,
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      await this.viewTimelineUseCase.handle(
        { user: passedParams[0] },
        this.cliPresenter,
      );
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'wall', arguments: '<user>' })
class WallCommand extends CommandRunner {
  constructor(
    private readonly cliPresenter: CliTimelinePresenter,
    private readonly viewWallUseCase: ViewWallUseCase,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      await this.viewWallUseCase.handle(
        { user: passedParams[0] },
        this.cliPresenter,
      );
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

export const commands = [
  PostCommand,
  EditCommand,
  FollowCommand,
  ViewCommand,
  WallCommand,
];
