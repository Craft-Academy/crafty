import {
  EditMessageCommand,
  EditMessageUseCase,
} from "../application/usecases/edit-message.usecase";
import { Message } from "../domain/message";
import { InMemoryMessageRepository } from "../infra/message.inmemory.repository";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../application/usecases/post-message.usecase";
import { StubDateProvider } from "../infra/stub-date-provider";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import { DefaultTimelinePresenter } from "../apps/timeline.default.presenter";
import { TimelinePresenter } from "../application/timeline.presenter";

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  let thrownError: Error;
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );
  const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
  const timelinePresenter: TimelinePresenter = {
    show(theTimeline) {
      timeline = defaultTimelinePresenter.show(theTimeline);
    },
  };
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserPostsAmessage(postMessageCommand: PostMessageCommand) {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async whenUserSeesTheTimelineOf(user: string) {
      await viewTimelineUseCase.handle({ user }, timelinePresenter);
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[]
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    messageRepository,
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
