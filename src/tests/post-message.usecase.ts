export type Message = {
  id: string;
  author: string;
  text: string;
  publishedAt: Date;
};

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};

export class PostMessageUseCase {
  handle(postMessageCommand: PostMessageCommand) {
    message = {
      id: postMessageCommand.id,
      text: postMessageCommand.text,
      author: postMessageCommand.author,
      publishedAt: now,
    };
  }
}
