import * as path from "path";
import * as fs from "fs";
import { Message, MessageRepository } from "./post-message.usecase";

export class FileSystemMessageRepository implements MessageRepository {
  save(message: Message): Promise<void> {
    return fs.promises.writeFile(
      path.join(__dirname, "message.json"),
      JSON.stringify(message)
    );
  }
}
