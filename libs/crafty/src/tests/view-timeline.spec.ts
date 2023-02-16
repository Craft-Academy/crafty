import { messageBuilder } from "./message.builder";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";

describe("Feature: Viewing a personnal timeline", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view the 3 messages she published in her timeline", async () => {
      const aliceMessageBuilder = messageBuilder().authoredBy("Alice");
      fixture.givenTheFollowingMessagesExist([
        aliceMessageBuilder
          .withId("message-1")
          .withText("My first message")
          .publishedAt(new Date("2023-02-07T16:27:59.000Z"))
          .build(),
        messageBuilder()
          .authoredBy("Bob")
          .withId("message-2")
          .withText("Hi it's Bob")
          .publishedAt(new Date("2023-02-07T16:29:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-3")
          .withText("How are you all ?")
          .publishedAt(new Date("2023-02-07T16:30:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-4")
          .withText("My last message")
          .publishedAt(new Date("2023-02-07T16:30:30.000Z"))
          .build(),
      ]);
      fixture.givenNowIs(new Date("2023-02-07T16:31:00.000Z"));

      await fixture.whenUserSeesTheTimelineOf("Alice");

      fixture.thenUserShouldSee([
        {
          author: "Alice",
          text: "My last message",
          publicationTime: "less than a minute ago",
        },
        {
          author: "Alice",
          text: "How are you all ?",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "My first message",
          publicationTime: "3 minutes ago",
        },
      ]);
    });
  });
});
