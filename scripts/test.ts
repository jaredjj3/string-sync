import chalk from 'chalk';
import * as constants from './constants';
import * as docker from './docker';
import { Project } from './types';
import { cmd, identity, log } from './util';

const bashC = (...parts: string[]) => {
  return `bash -c "${parts.filter(identity).join(' ')}"`;
};

const getTestCmd = (project: Project, ci: boolean, watch: boolean) => {
  return [
    'yarn',
    `test:${project}`,
    `--watchAll=${watch}`,
    ci ? '--no-colors' : '--colors',
    ci ? '--reporters=jest-junit' : '',
  ].filter(identity);
};

const getJestEnvFlags = (project: Project, ci: boolean) => {
  return [ci ? '-e' : '', ci ? 'JEST_NUM_WORKERS=2' : ''].filter(identity);
};

const doTest = async (composeFile: string, project: Project, ci: boolean, watch: boolean) => {
  try {
    await cmd(
      'docker-compose',
      [
        '-f',
        composeFile,
        'run',
        '--rm',
        ...getJestEnvFlags(project, ci),
        'test',
        bashC(...getTestCmd(project, ci, watch)),
      ].filter(identity),
      {
        shell: true,
      }
    );
    log(chalk.green(`${project} tests succeeded`));
  } catch (err) {
    log(chalk.red(`${project} tests failed`));
    throw err;
  }
};

export const run = async (project: Project, ci: boolean, watch: boolean) => {
  let composeFile: string;
  switch (project) {
    case Project.API:
      composeFile = constants.DOCKER_COMPOSE_API_TEST_FILE;
      break;
    case Project.WEB:
      composeFile = constants.DOCKER_COMPOSE_WEB_TEST_FILE;
      break;
    default:
      throw new TypeError(`unrecognized project: ${project}`);
  }

  try {
    await doTest(composeFile, project, ci, watch);
  } finally {
    await docker.down();
  }
};
