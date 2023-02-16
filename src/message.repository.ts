import { Message } from "./message";

export interface MessageRepository {
  save(message: Message): Promise<void>;
  getAllOfUser(user: string): Promise<Message[]>;
}
