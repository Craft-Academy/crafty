import { EmptyMessageError, MessageText, MessageTooLongError } from "./message";
import { MessageRepository } from "./message.repository";

export type EditMessageCommand = {
  messageId: string;
  text: string;
};

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(editMessageCommand: EditMessageCommand) {
    const messageText = MessageText.of(editMessageCommand.text);
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId
    );

    const editedMessage = {
      ...message,
      text: messageText,
    };

    await this.messageRepository.save(editedMessage);
  }
}
