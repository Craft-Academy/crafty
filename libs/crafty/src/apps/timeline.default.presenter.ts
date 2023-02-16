import { Timeline } from "../domain/timeline";
import { TimelinePresenter } from "../application/timeline.presenter";
import { DateProvider } from "../application/date-provider";

export class DefaultTimelinePresenter implements TimelinePresenter {
  constructor(private readonly dateProvider: DateProvider) {}

  show(
    timeline: Timeline
  ): { author: string; text: string; publicationTime: string }[] {
    const messages = timeline.data;
    return messages.map((m) => ({
      author: m.author,
      text: m.text,
      publicationTime: this.computePublicationTime(m.publishedAt),
    }));
  }

  private computePublicationTime(publishedAt: Date) {
    const now = this.dateProvider.getNow();
    const minutes = (now.getTime() - publishedAt.getTime()) / 60000;
    if (minutes < 1) {
      return "less than a minute ago";
    }
    if (minutes < 2) {
      return "1 minute ago";
    }
    return `${Math.floor(minutes)} minutes ago`;
  }
}
