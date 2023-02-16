import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { CliModule } from '../src/cli.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from 'testcontainers';
import { PrismaClient } from '@prisma/client';
import { StubDateProvider } from '@crafty/crafty/infra/stub-date-provider';
import { promisify } from 'util';
import { exec } from 'child_process';
import { DateProvider } from '@crafty/crafty/application/date-provider';
import { PrismaMessageRepository } from '@crafty/crafty/infra/prisma/message.prisma.repository';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';

const asyncExec = promisify(exec);

describe('Cli App (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let commandInstance: TestingModule;
  const now = new Date('2023-02-14T19:00:00.000Z');
  const dateProvider = new StubDateProvider();
  dateProvider.now = now;
  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty')
      .withUsername('crafty')
      .withPassword('crafty')
      .withExposedPorts(5432)
      .start();
    const databaseUrl = `postgresql://crafty:crafty@${container.getHost()}:${container.getMappedPort(
      5432,
    )}/crafty?schema=public`;
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

  beforeEach(async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [CliModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  test('post command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await CommandTestFactory.run(commandInstance, [
      'post',
      'Alice',
      'Message from test',
    ]);

    const aliceMessages = await messageRepository.getAllOfUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from test',
      publishedAt: now,
    });
  });

  test('view command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const consoleTable = jest.fn();
    jest.spyOn(console, 'table').mockImplementation(consoleTable);
    await messageRepository.save(
      messageBuilder()
        .authoredBy('Alice')
        .withId('alice-msg-id')
        .publishedAt(now)
        .withText('Message Test View command')
        .build(),
    );

    await CommandTestFactory.run(commandInstance, ['view', 'Alice']);

    expect(consoleTable).toHaveBeenCalledWith([
      {
        author: 'Alice',
        publicationTime: 'less than a minute ago',
        text: 'Message Test View command',
      },
    ]);
  });
});
