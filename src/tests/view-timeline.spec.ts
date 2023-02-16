import { Message } from "../message";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { ViewTimelineUseCase } from "../view-timeline.usecase";

describe("Feature: Viewing a personnal timeline", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view the 2 messages she published in her timeline", async () => {
      fixture.givenTheFollowingMessagesExist([
        {
          author: "Alice",
          text: "My first message",
          id: "message-1",
          publishedAt: new Date("2023-02-07T16:28:00.000Z"),
        },
        {
          author: "Bob",
          text: "Hi it's Bob",
          id: "message-2",
          publishedAt: new Date("2023-02-07T16:29:00.000Z"),
        },
        {
          author: "Alice",
          text: "How are you all ?",
          id: "message-3",
          publishedAt: new Date("2023-02-07T16:30:00.000Z"),
        },
      ]);
      fixture.givenNowIs(new Date("2023-02-07T16:31:00.000Z"));

      await fixture.whenUserSeesTheTimelineOf("Alice");

      fixture.thenUserShouldSee([
        {
          author: "Alice",
          text: "How are you all ?",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "My first message",
          publicationTime: "2 minutes ago",
        },
      ]);
    });
  });
});

const createFixture = () => {
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  const messageRepository = new InMemoryMessageRepository();
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    givenNowIs(now: Date) {},
    async whenUserSeesTheTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[]
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
