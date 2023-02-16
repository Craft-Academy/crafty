import { Injectable } from '@nestjs/common';

export type Followee = {
  user: string;
  followee: string;
};

@Injectable()
export abstract class FolloweeRepository {
  abstract saveFollowee(followee: Followee): Promise<void>;
  abstract getFolloweesOf(user: string): Promise<string[]>;
}
