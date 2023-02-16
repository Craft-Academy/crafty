import * as path from "path";
import * as fs from "fs";
import {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class FileSystemFolloweeRepository implements FolloweeRepository {
  constructor(
    private readonly followeesPath = path.join(__dirname, "./followees.json")
  ) {}

  async saveFollowee(followee: Followee): Promise<void> {
    const followees = await this.getFollowees();
    const actualUserFollowees = followees[followee.user] ?? [];
    actualUserFollowees.push(followee.followee);
    followees[followee.user] = actualUserFollowees;

    return fs.promises.writeFile(this.followeesPath, JSON.stringify(followees));
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    const allFollowees = await this.getFollowees();

    return allFollowees[user];
  }

  private async getFollowees() {
    const data = await fs.promises.readFile(this.followeesPath);

    return JSON.parse(data.toString()) as { [user: string]: string[] };
  }
}
