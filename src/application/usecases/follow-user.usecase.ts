import { FolloweeRepository } from "../followee.repository";

export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

export class FollowUserUseCase {
  constructor(private readonly followeeRepository: FolloweeRepository) {}
  async handle(followUserCommand: FollowUserCommand) {
    return this.followeeRepository.saveFollowee({
      user: followUserCommand.user,
      followee: followUserCommand.userToFollow,
    });
  }
}
