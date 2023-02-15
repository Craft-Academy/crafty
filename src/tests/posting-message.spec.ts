describe("Feature: Posting a message", () => {
  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", () => {
      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      whenUserPostsAmessage({
        id: "message-id",
        text: "Hello World 2",
        author: "Alice",
      });

      thenPostedMessageShouldBe({
        id: "message-id",
        author: "Alice",
        text: "Hello World 2",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });
  });
});

let message: { id: string; author: string; text: string; publishedAt: Date };
let now: Date;

function givenNowIs(_now: Date) {
  now = _now;
}

function whenUserPostsAmessage(postMessageCommand: {
  id: string;
  text: string;
  author: string;
}) {
  message = {
    id: postMessageCommand.id,
    text: postMessageCommand.text,
    author: postMessageCommand.author,
    publishedAt: now,
  };
}

function thenPostedMessageShouldBe(expectedMessage: {
  id: string;
  author: string;
  text: string;
  publishedAt: Date;
}) {
  expect(expectedMessage).toEqual(message);
}
