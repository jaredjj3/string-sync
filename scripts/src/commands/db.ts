import { Command, flags } from '@oclif/command';
import { execSync } from 'child_process';

export default class Db extends Command {
  static description = 'Runs a db console.';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.parse(Db);
    execSync('ss exec db psql -U stringsync', { stdio: 'inherit' });
  }
}