import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "testcontainers";
import { PrismaMessageRepository } from "../prisma/message.prisma.repository";
import { messageBuilder } from "../../tests/message.builder";

const asyncExec = promisify(exec);

describe("PrismaMessageRepository", () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase("crafty-test")
      .withUsername("crafty-test")
      .withPassword("crafty-test")
      .withExposedPorts(5432)
      .start();
    const databaseUrl = `postgresql://crafty-test:crafty-test@${container.getHost()}:${container.getMappedPort(
      5432
    )}/crafty-test?schema=public`;
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    await prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test("save() should save a new message", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .authoredBy("Alice")
        .withId("message-id")
        .withText("Hello World !")
        .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
        .build()
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: { id: "message-id" },
    });
    expect(expectedMessage).toEqual({
      id: "message-id",
      authorId: "Alice",
      publishedAt: new Date("2023-02-09T15:50:00.000Z"),
      text: "Hello World !",
    });
  });

  test("save() should update an existing message", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const aliceMessageBuilder = messageBuilder()
      .authoredBy("Alice")
      .withId("message-id")
      .withText("Hello World !")
      .publishedAt(new Date("2023-02-09T15:50:00.000Z"));
    await messageRepository.save(aliceMessageBuilder.build());

    await messageRepository.save(
      aliceMessageBuilder.withText("Hello World 2").build()
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: { id: "message-id" },
    });
    expect(expectedMessage).toEqual({
      id: "message-id",
      authorId: "Alice",
      publishedAt: new Date("2023-02-09T15:50:00.000Z"),
      text: "Hello World 2",
    });
  });

  test("getById() should return a message by its id", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const aliceMessage = messageBuilder()
      .authoredBy("Alice")
      .withId("message-id")
      .withText("Hello World !")
      .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
      .build();
    await messageRepository.save(aliceMessage);

    const retrievedMessage = await messageRepository.getById("message-id");

    expect(retrievedMessage).toEqual(
      messageBuilder()
        .authoredBy("Alice")
        .withId("message-id")
        .withText("Hello World !")
        .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
        .build()
    );
  });

  test("getAllOfUser() should return all user messages", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    await Promise.all([
      messageRepository.save(
        messageBuilder()
          .authoredBy("Alice")
          .withId("message-id")
          .withText("Hello World !")
          .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
          .build()
      ),
      messageRepository.save(
        messageBuilder()
          .authoredBy("Bob")
          .withId("message-id2")
          .withText("Hi from Bob")
          .publishedAt(new Date("2023-02-09T15:52:00.000Z"))
          .build()
      ),
      messageRepository.save(
        messageBuilder()
          .authoredBy("Alice")
          .withId("message-id3")
          .withText("Second message")
          .publishedAt(new Date("2023-02-09T15:55:00.000Z"))
          .build()
      ),
    ]);

    const aliceMessages = await messageRepository.getAllOfUser("Alice");

    expect(aliceMessages).toHaveLength(2);
    expect(aliceMessages).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .authoredBy("Alice")
          .withId("message-id")
          .withText("Hello World !")
          .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
          .build(),
        messageBuilder()
          .authoredBy("Alice")
          .withId("message-id3")
          .withText("Second message")
          .publishedAt(new Date("2023-02-09T15:55:00.000Z"))
          .build(),
      ])
    );
  });
});
