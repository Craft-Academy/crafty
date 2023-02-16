import { DateProvider } from "../application/date-provider";

export class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}
