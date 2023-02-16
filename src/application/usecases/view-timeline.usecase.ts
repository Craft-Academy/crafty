import { DateProvider } from "../date-provider";
import { MessageRepository } from "../message.repository";

const ONE_MINUTE_IN_MS = 60000;

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user);
    messagesOfUser.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );

    return messagesOfUser.map((msg) => ({
      author: msg.author,
      text: msg.text,
      publicationTime: this.publicationTime(msg.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date) {
    const now = this.dateProvider.getNow();
    const diff = now.getTime() - publishedAt.getTime();
    const minutes = Math.floor(diff / ONE_MINUTE_IN_MS);
    if (minutes < 1) {
      return "less than a minute ago";
    }
    if (minutes < 2) {
      return "1 minute ago";
    }

    return `${minutes} minutes ago`;
  }
}
