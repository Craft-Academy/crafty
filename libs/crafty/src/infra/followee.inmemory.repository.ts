import {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class InMemoryFolloweeRepository implements FolloweeRepository {
  followeesByUser = new Map<string, string[]>();

  saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee);

    return Promise.resolve();
  }

  givenExistingFollowees(followees: Followee[]) {
    followees.forEach((f) => this.addFollowee(f));
  }

  private addFollowee(followee: Followee) {
    const existingFollowees = this.followeesByUser.get(followee.user) ?? [];
    existingFollowees.push(followee.followee);
    this.followeesByUser.set(followee.user, existingFollowees);
  }

  async getFolloweesOf(user: string) {
    return Promise.resolve(this.followeesByUser.get(user) ?? []);
  }
}
