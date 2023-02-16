import { DateProvider } from "../application/date-provider";

export class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}
