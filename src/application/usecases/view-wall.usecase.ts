import { Timeline } from "../../domain/timeline";
import { DateProvider } from "../date-provider";
import { FolloweeRepository } from "../followee.repository";
import { MessageRepository } from "../message.repository";

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({
    user,
  }: {
    user: string;
  }): Promise<{ author: string; text: string; publicationTime: string }[]> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const messages = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getAllOfUser(user)
        )
      )
    ).flat();

    const timeline = new Timeline(messages, this.dateProvider.getNow());

    return timeline.data;
  }
}
