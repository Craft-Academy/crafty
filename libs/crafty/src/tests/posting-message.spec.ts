import { EmptyMessageError, MessageTooLongError } from "../domain/message";
import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging.fixture";
describe("Feature: Posting a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAmessage({
        id: "message-id",
        text: "Hello World 2",
        author: "Alice",
      });

      await fixture.thenMessageShouldBe(
        messageBuilder()
          .withId("message-id")
          .authoredBy("Alice")
          .withText("Hello World 2")
          .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
          .build()
      );
    });

    test("Alice cannot post a message with more than 280 characters", async () => {
      const textWithLengthOf281 =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mauris lacus, fringilla eu est vitae, varius viverra nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vivamus suscipit feugiat sollicitudin. Aliquam erat volutpat amet.";
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAmessage({
        id: "message-id",
        author: "Alice",
        text: textWithLengthOf281,
      });

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe("Rule: A message cannot be empty", () => {
    test("Alice cannot post an empty message", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAmessage({
        id: "message-id",
        author: "Alice",
        text: "",
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
    test("Alice cannot post an message with only whitespaces", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      await fixture.whenUserPostsAmessage({
        id: "message-id",
        author: "Alice",
        text: "    ",
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});
