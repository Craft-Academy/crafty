import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "testcontainers";
import { promisify } from "util";
import { PrismaFolloweeRepository } from "../prisma/followee.prisma.repository";

const asyncExec = promisify(exec);

describe("PrismaFolloweeRepository", () => {
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

    return prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(() => {
    return prismaClient.user.deleteMany();
  });

  test("saveFollowee", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });
    await followeeRepository.saveFollowee({
      user: "Bob",
      followee: "Tom",
    });

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Bob",
    });

    const alice = await prismaClient.user.findFirstOrThrow({
      where: { name: "Alice" },
      include: { following: true },
    });
    expect(alice.following).toEqual([
      expect.objectContaining({
        name: "Charlie",
      }),
      expect.objectContaining({
        name: "Bob",
      }),
    ]);
  });

  test("getFolloweesOf", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });
    await followeeRepository.saveFollowee({ user: "Alice", followee: "Bob" });

    const followees = await followeeRepository.getFolloweesOf("Alice");

    expect(followees).toHaveLength(2);
    expect(followees).toEqual(expect.arrayContaining(["Bob", "Charlie"]));
  });
});
