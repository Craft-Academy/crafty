import { ConsoleLogger } from '@nestjs/common';

export class CustomConsoleLogger extends ConsoleLogger {
  table(tabularData: any) {
    console.table(tabularData);
  }
}
