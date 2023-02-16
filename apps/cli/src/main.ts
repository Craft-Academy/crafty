#!/usr/bin/env node
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule, ['error']);
}

bootstrap();
