import { EmptyMessageError, MessageTooLongError } from "../../domain/message";
import { MessageRepository } from "../message.repository";
import { Err, Ok, Result } from "../result";

export type EditMessageCommand = {
  messageId: string;
  text: string;
};

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(
    editMessageCommand: EditMessageCommand
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId
    );

    try {
      message.editText(editMessageCommand.text);
    } catch (err) {
      if (err instanceof EmptyMessageError) {
      }
      return Err.of(err);
    }

    await this.messageRepository.save(message);

    return Ok.of(undefined);
  }
}
