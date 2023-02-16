#!/usr/bin/env node
import { Command } from "commander";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "./src/application/usecases/edit-message.usecase";
import { FileSystemMessageRepository } from "./src/infra/message.fs.repository";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "./src/application/usecases/view-timeline.usecase";
import { RealDateProvider } from "./src/infra/real-date-provider";

const messageRepository = new FileSystemMessageRepository();
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);

const program = new Command();
program
  .version("1.0.0")
  .description("Crafty social network")
  .addCommand(
    new Command("post")
      .argument("<user>", "the current user")
      .argument("<message>", "the message to post")
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: `${Math.floor(Math.random() * 10000)}`,
          author: user,
          text: message,
        };
        try {
          await postMessageUseCase.handle(postMessageCommand);
          console.log("✅ Message posté");
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("edit")
      .argument("<message-id>", "the message id of the message to edit")
      .argument("<message>", "the new text")
      .action(async (messageId, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId,
          text: message,
        };
        try {
          await editMessageUseCase.handle(editMessageCommand);
          console.log("✅ Message edité");
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("view")
      .argument("<user>", "the user to view the timeline of")
      .action(async (user) => {
        try {
          const timeline = await viewTimelineUseCase.handle({ user });
          console.table(timeline);
          process.exit(0);
        } catch (err) {
          console.error(err);
          process.exit(1);
        }
      })
  );

async function main() {
  await program.parseAsync();
}

main();
