import { Injectable } from '@nestjs/common';
import { Timeline } from '../../domain/timeline';
import { DateProvider } from '../date-provider';
import { MessageRepository } from '../message.repository';
import { TimelinePresenter } from '../timeline.presenter';

@Injectable()
export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async handle(
    { user }: { user: string },
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user);

    const timeline = new Timeline(messagesOfUser);

    timelinePresenter.show(timeline);
  }
}
