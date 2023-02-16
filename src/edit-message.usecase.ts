import { MessageRepository } from "./message.repository";
import { EmptyMessageError, MessageTooLongError } from "./post-message.usecase";

export type EditMessageCommand = {
  messageId: string;
  text: string;
};

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(editMessageCommand: EditMessageCommand) {
    if (editMessageCommand.text.length > 280) {
      throw new MessageTooLongError();
    }
    if (editMessageCommand.text.trim().length === 0) {
      throw new EmptyMessageError();
    }
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId
    );

    const editedMessage = {
      ...message,
      text: editMessageCommand.text,
    };

    await this.messageRepository.save(editedMessage);
  }
}
