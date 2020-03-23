import { Command, flags } from '@oclif/command';
import { ROOT_PATH } from '../util';
import rimraf from 'rimraf';
import { spawn } from 'child_process';
import * as path from 'path';

const SRC_DIR = path.join(ROOT_PATH, 'common');
const DST_DIRS = [
  path.join(ROOT_PATH, 'server', 'src'),
  path.join(ROOT_PATH, 'web', 'src'),
];

export default class Common extends Command {
  static description = 'Copies the common dir to all the projects.';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.parse(Common);

    for (const dstDir of DST_DIRS) {
      rimraf.sync(path.join(dstDir, 'common'));
    }

    for (const dstDir of DST_DIRS) {
      spawn('cp', ['-R', SRC_DIR, dstDir], {
        cwd: ROOT_PATH,
        stdio: 'inherit',
      });
      this.log(`updated: ${dstDir}`);
    }
  }
}
