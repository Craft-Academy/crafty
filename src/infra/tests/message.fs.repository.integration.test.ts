import * as path from "path";
import * as fs from "fs";
import { FileSystemMessageRepository } from "../message.fs.repository";
import { messageBuilder } from "../../tests/message.builder";

const testMessagesPath = path.join(__dirname, "./messages-test.json");

describe("FileSystemMessageRepository", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testMessagesPath, JSON.stringify([]));
  });
  test("save() can save a message in the filesystem", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);

    await messageRepository.save(
      messageBuilder()
        .authoredBy("Alice")
        .withId("m1")
        .publishedAt(new Date("2023-02-16T14:54:00.000Z"))
        .withText("Test message")
        .build()
    );

    const messagesData = await fs.promises.readFile(testMessagesPath);
    const messagesJSON = JSON.parse(messagesData.toString());
    expect(messagesJSON).toEqual([
      {
        id: "m1",
        author: "Alice",
        publishedAt: "2023-02-16T14:54:00.000Z",
        text: "Test message",
      },
    ]);
  });

  test("save() can update an existing message in the filesystem", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);
    await fs.promises.writeFile(
      testMessagesPath,
      JSON.stringify([
        {
          id: "m1",
          author: "Alice",
          publishedAt: "2023-02-16T14:54:00.000Z",
          text: "Test message",
        },
      ])
    );

    await messageRepository.save(
      messageBuilder()
        .authoredBy("Alice")
        .withId("m1")
        .publishedAt(new Date("2023-02-16T14:54:00.000Z"))
        .withText("Test message edited")
        .build()
    );

    const messagesData = await fs.promises.readFile(testMessagesPath);
    const messagesJSON = JSON.parse(messagesData.toString());
    expect(messagesJSON).toEqual([
      {
        id: "m1",
        author: "Alice",
        publishedAt: "2023-02-16T14:54:00.000Z",
        text: "Test message edited",
      },
    ]);
  });

  test("getById returns a message by its id", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);
    await fs.promises.writeFile(
      testMessagesPath,
      JSON.stringify([
        {
          id: "m1",
          author: "Alice",
          publishedAt: "2023-02-16T14:54:00.000Z",
          text: "Test message",
        },
        {
          id: "m2",
          author: "Bob",
          publishedAt: "2023-02-16T14:55:00.000Z",
          text: "Hello from Bob",
        },
      ])
    );

    const bobMessage = await messageRepository.getById("m2");

    expect(bobMessage).toEqual(
      messageBuilder()
        .withId("m2")
        .authoredBy("Bob")
        .publishedAt(new Date("2023-02-16T14:55:00.000Z"))
        .withText("Hello from Bob")
        .build()
    );
  });

  test("getAllOfUser returns all the messages of a specific user", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);
    await fs.promises.writeFile(
      testMessagesPath,
      JSON.stringify([
        {
          id: "m1",
          author: "Alice",
          publishedAt: "2023-02-16T14:54:00.000Z",
          text: "Test message",
        },
        {
          id: "m2",
          author: "Bob",
          publishedAt: "2023-02-16T14:55:00.000Z",
          text: "Hello from Bob",
        },
        {
          id: "m3",
          author: "Alice",
          publishedAt: "2023-02-16T14:56:00.000Z",
          text: "Alice message 2",
        },
      ])
    );

    const aliceMessages = await messageRepository.getAllOfUser("Alice");

    expect(aliceMessages).toHaveLength(2);
    expect(aliceMessages).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withId("m1")
          .authoredBy("Alice")
          .publishedAt(new Date("2023-02-16T14:54:00.000Z"))
          .withText("Test message")
          .build(),
        messageBuilder()
          .withId("m3")
          .authoredBy("Alice")
          .publishedAt(new Date("2023-02-16T14:56:00.000Z"))
          .withText("Alice message 2")
          .build(),
      ])
    );
  });
});
