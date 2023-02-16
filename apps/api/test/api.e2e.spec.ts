import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
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

describe('Api (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let app: INestApplication;
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

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  it('/post (POST)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await request(app.getHttpServer())
      .post('/post')
      .send({ user: 'Alice', message: 'Message from api test' })
      .expect(201);

    const aliceMessages = await messageRepository.getAllOfUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from api test',
      publishedAt: now,
    });
  });

  it('/view (GET)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .authoredBy('Alice')
        .withId('alice-msg-id')
        .publishedAt(now)
        .withText('Message Test View Api')
        .build(),
    );

    await request(app.getHttpServer())
      .get('/view')
      .query({ user: 'Alice' })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([
          {
            id: expect.any(String),
            author: 'Alice',
            text: 'Message Test View Api',
            publishedAt: now.toISOString(),
          },
        ]);
      });
  });
});
