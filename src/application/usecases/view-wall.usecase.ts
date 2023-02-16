import { Timeline } from "../../domain/timeline";
import { DateProvider } from "../date-provider";
import { FolloweeRepository } from "../followee.repository";
import { MessageRepository } from "../message.repository";
import { TimelinePresenter } from "../timeline.presenter";

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository
  ) {}

  async handle(
    {
      user,
    }: {
      user: string;
    },
    timelinePresenter: TimelinePresenter
  ): Promise<void> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const messages = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getAllOfUser(user)
        )
      )
    ).flat();

    const timeline = new Timeline(messages);

    timelinePresenter.show(timeline);
  }
}
