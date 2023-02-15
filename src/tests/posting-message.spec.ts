describe("Feature: Posting a message", () => {
  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", () => {
      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

      whenUserPostsAmessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });

      thenPostedMessageShouldBe({
        id: "message-id",
        author: "Alice",
        text: "Hello World",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });
  });
});

function givenNowIs(now: Date) {}

function whenUserPostsAmessage(postMessageCommand: {
  id: string;
  text: string;
  author: string;
}) {}

function thenPostedMessageShouldBe(expectedMessage: {
  id: string;
  author: string;
  text: string;
  publishedAt: Date;
}) {
  expect(true).toBe(false);
}
