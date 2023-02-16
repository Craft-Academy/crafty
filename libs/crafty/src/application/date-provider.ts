import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class DateProvider {
  abstract getNow(): Date;
}
