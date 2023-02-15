import {
  DateProvider,
  EmptyMessageError,
  Message,
  MessageRepository,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";

describe("Feature: Posting a message", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      fixture.whenUserPostsAmessage({
        id: "message-id",
        text: "Hello World 2",
        author: "Alice",
      });

      fixture.thenPostedMessageShouldBe({
        id: "message-id",
        author: "Alice",
        text: "Hello World 2",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });

    test("Alice cannot post a message with more than 280 characters", () => {
      const textWithLengthOf281 =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mauris lacus, fringilla eu est vitae, varius viverra nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vivamus suscipit feugiat sollicitudin. Aliquam erat volutpat amet.";
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      fixture.whenUserPostsAmessage({
        id: "message-id",
        author: "Alice",
        text: textWithLengthOf281,
      });

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe("Rule: A message cannot be empty", () => {
    test("Alice cannot post an empty message", () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      fixture.whenUserPostsAmessage({
        id: "message-id",
        author: "Alice",
        text: "",
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
    test("Alice cannot post an message with only whitespaces", () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      fixture.whenUserPostsAmessage({
        id: "message-id",
        author: "Alice",
        text: "    ",
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});

class InMemoryMessageRepository implements MessageRepository {
  message: Message;
  save(msg: Message): void {
    this.message = msg;
  }
}

class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}

const createFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;
  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    whenUserPostsAmessage(postMessageCommand: PostMessageCommand) {
      try {
        postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    thenPostedMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(messageRepository.message);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
