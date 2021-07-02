import chalk from 'chalk';
import execa from 'execa';

export const noop = () => undefined;

export const identity = <T>(x: T): T => x;

export const log = (msg: string) => {
  console.log(`ss: ${msg}`);
};

type CmdOpts = {
  shell?: boolean;
  reject?: boolean;
  cwd?: string;
};

export const cmd = async (command: string, args: string[], opts?: CmdOpts) => {
  const cmdStr = [command, ...args].join(' ');
  log(chalk.yellow(cmdStr));
  return await execa(command, args, { stdio: 'inherit', ...opts });
};
