import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import * as httpErrors from "http-errors";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "../application/usecases/edit-message.usecase";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import { RealDateProvider } from "../infra/real-date-provider";
import {
  FollowUserCommand,
  FollowUserUseCase,
} from "../application/usecases/follow-user.usecase";
import { ViewWallUseCase } from "../application/usecases/view-wall.usecase";
import { PrismaClient } from "@prisma/client";
import { PrismaMessageRepository } from "../infra/prisma/message.prisma.repository";
import { PrismaFolloweeRepository } from "../infra/prisma/followee.prisma.repository";
import { TimelinePresenter } from "../application/timeline.presenter";
import { Timeline } from "../domain/timeline";

class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}

  show(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
  }
}

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFolloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider
);
const viewWallUseCase = new ViewWallUseCase(
  messageRepository,
  followeeRepository
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);

const fastify = Fastify({ logger: true });

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; message: string } }>(
    "/post",
    {},
    async (request, reply) => {
      const postMessageCommand: PostMessageCommand = {
        id: `${Math.floor(Math.random() * 10000)}`,
        author: request.body.user,
        text: request.body.message,
      };
      try {
        await postMessageUseCase.handle(postMessageCommand);
        reply.status(201);
      } catch (err) {
        reply.send(httpErrors[500](err));
      }
    }
  );

  fastifyInstance.post<{
    Body: { messageId: string; message: string };
  }>("/edit", {}, async (request, reply) => {
    const editMessageCommand: EditMessageCommand = {
      messageId: request.body.messageId,
      text: request.body.message,
    };
    try {
      await editMessageUseCase.handle(editMessageCommand);
      reply.status(200);
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.post<{
    Body: { user: string; followee: string };
  }>("/follow", {}, async (request, reply) => {
    const followUserCommand: FollowUserCommand = {
      user: request.body.user,
      userToFollow: request.body.followee,
    };
    try {
      await followUserUseCase.handle(followUserCommand);
      reply.status(201);
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
      | { author: string; text: string; publicationTime: string }[]
      | httpErrors.HttpError<500>;
  }>("/view", {}, async (request, reply) => {
    const timelinePresenter = new ApiTimelinePresenter(reply);
    try {
      await viewTimelineUseCase.handle(
        {
          user: request.query.user,
        },
        timelinePresenter
      );
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
      | { author: string; text: string; publicationTime: string }[]
      | httpErrors.HttpError<500>;
  }>("/wall", {}, async (request, reply) => {
    try {
      const timelinePresenter = new ApiTimelinePresenter(reply);
      await viewWallUseCase.handle(
        { user: request.query.user },
        timelinePresenter
      );
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });
};

fastify.register(routes);

fastify.addHook("onClose", async () => {
  await prismaClient.$disconnect();
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
