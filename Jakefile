const { task, desc, namespace } = require('jake');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const log = (msg) => console.log(`jake: ${msg}`);
const identity = (x) => x;
const env = (name, fallback = undefined) => {
  const val = process.env[name];
  if (typeof val === 'undefined') {
    if (typeof fallback === 'undefined') {
      throw new Error(`env variable is not defined with no fallback: ${name}`);
    } else {
      log(chalk.magenta(`${name} (default): ${fallback}`));
      return fallback;
    }
  }
  log(chalk.magenta(`${name} (provided): ${val}`));
  return val;
};

const VERBOSE = env('VERBOSE', 'false') === 'true';
const QUIET = env('QUIET', 'false') === 'true';

if (VERBOSE && QUIET) {
  throw new Error('cannot specify VERBOSE=true and QUIET=true env vars');
}

const DEFAULT_CMD_OPTS = { cwd: __dirname, stdio: 'ignore', shell: false };

const cmd = (command) => (args, opts) => {
  opts = { ...DEFAULT_CMD_OPTS, ...opts };

  opts.stdio = VERBOSE ? 'inherit' : opts.stdio;
  opts.stdio = QUIET ? 'ignore' : opts.stdio;

  const process = spawn(command, args, { cwd: opts.cwd, stdio: opts.stdio, shell: opts.shell });

  const promise = new Promise((resolve, reject) => {
    const cmdStr = [command, ...args].join(' ');
    log(chalk.yellow(cmdStr));

    process.on('close', (exitCode) => {
      // exitCode === null means the process was killed
      if (exitCode === 0 || exitCode === null) {
        resolve();
      } else {
        reject(new Error(`nonzero exit code: ${exitCode}`));
      }
    });
    process.on('error', (err) => {
      reject(err);
    });
  });

  return { process, promise };
};

const yarn = cmd('yarn');
const dockerCompose = cmd('docker-compose');
const docker = cmd('docker');
const cp = cmd('cp');
const mkdir = cmd('mkdir');
const git = cmd('git');
const aws = cmd('aws');
const rm = cmd('rm');

desc('brings up all projects');
task('dev', ['build:docker', 'gensecrets'], async () => {
  try {
    const api = dockerCompose(['-f', 'docker-compose.dev.yml', 'up'], { stdio: 'inherit' });
    await api.promise;
  } finally {
    const down = dockerCompose(['down'], { stdio: 'inherit' });
    await down.promise;
  }
});

desc('brings up a prod orchestration using dev resources');
task('fakeprod', ['build:docker', 'gensecrets'], async () => {
  try {
    const api = dockerCompose(['-f', 'docker-compose.yml', 'up'], { stdio: 'inherit' });
    await api.promise;
  } finally {
    const down = dockerCompose(['down'], { stdio: 'inherit' });
    await down.promise;
  }
});

namespace('tsc', () => {
  desc('locally typechecks the api project');
  task('api', ['install:api'], async () => {
    const WATCH = env('WATCH', 'true') === 'true';

    const tsc = yarn(['tsc', '--noEmit', WATCH ? '--watch' : ''].filter(identity), {
      stdio: 'inherit',
      cwd: 'api',
    });
    process.on('SIGINT', tsc.process.kill);
    await tsc.promise;
  });

  desc('locally typechecks the web project');
  task('web', ['install:web'], async () => {
    const WATCH = env('WATCH', 'true') === 'true';

    const tsc = yarn(['tsc', '--noEmit', WATCH ? '--watch' : ''].filter(identity), {
      stdio: 'inherit',
      cwd: 'web',
    });
    process.on('SIGINT', tsc.process.kill);
    await tsc.promise;
  });
});

namespace('install', () => {
  desc('installs api dependencies');
  task('api', [], async () => {
    const install = yarn([], { cwd: 'api' });
    await install.promise;
  });

  desc('installs web dependencies');
  task('web', async () => {
    const install = yarn([], { cwd: 'web' });
    await install.promise;
  });
});

desc('generates graphql types for each project');
task('typegen', [], async () => {
  const GRAPHQL_HOSTNAME = env('GRAPHQL_HOSTNAME', 'localhost');
  const GRAPHQL_PORT = env('GRAPHQL_PORT', '3000');
  const MAX_WAIT_MS = parseInt(env('MAX_WAIT_MS', '1200000'), 10); // 2 minutes

  if (isNaN(MAX_WAIT_MS)) {
    throw new Error('MAX_WAIT_MS env var is not a number');
  }
  if (MAX_WAIT_MS < 0) {
    throw new Error('MAX_WAIT_MS env var must be a positive number');
  }

  const isServerUp = () => {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: GRAPHQL_HOSTNAME,
          port: GRAPHQL_PORT,
          path: '/health',
          method: 'GET',
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );

      req.on('error', () => {
        resolve(false);
      });

      req.end();
    });
  };

  const generateGraphqlTypes = async () => {
    const typegenApi = yarn(['typegen'], { cwd: 'api' });
    const typegenWeb = yarn(['typegen'], { cwd: 'web' });
    await Promise.all([typegenApi.promise, typegenWeb.promise]);
  };

  const waitForServer = async () => {
    const start = new Date();

    const getElapsedTimeMs = () => {
      const now = new Date();
      return now.getTime() - start.getTime();
    };

    const wait = (ms) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };

    process.stdout.write('waiting for graphql.');

    while (getElapsedTimeMs() < MAX_WAIT_MS) {
      process.stdout.write('.');

      const isReady = await isServerUp();
      if (isReady) {
        process.stdout.write('\n');
        log('graphql is up');
        return;
      }

      await wait(1000);
    }

    throw new Error('graphql never came up');
  };

  let up = undefined;
  const wasServerUp = await isServerUp();
  try {
    if (wasServerUp) {
      log('server already up');
    } else {
      log('temporarily starting server');
      up = dockerCompose(['up', '--detach'], { cwd: 'api' });
      await up.promise;
      await waitForServer();
    }

    await generateGraphqlTypes();
  } finally {
    // only kill the up process if it was created
    up && up.process.kill();

    if (!wasServerUp) {
      const down = dockerCompose(['down'], { cwd: 'api', stdio: 'inherit' });
      await down.promise;
    }
  }
});

namespace('build', () => {
  desc('builds the stringsync docker image');
  task('docker', [], async () => {
    const DOCKER_TAG = env('DOCKER_TAG', 'stringsync:latest');
    const DOCKERFILE = env('DOCKERFILE', 'Dockerfile');

    const build = docker(['build', '-f', DOCKERFILE, '-t', DOCKER_TAG, '.'], { stdio: 'inherit' });
    await build.promise;
  });

  desc('builds the stringsync production web build');
  task('web', ['install:web'], async () => {
    const build = yarn(['build'], { cwd: 'web', stdio: 'inherit' });
    await build.promise;
  });
});

namespace('test', () => {
  const PROJECTS = {
    api: 'api',
    web: 'web',
  };

  const bashC = (...parts) => {
    return `bash -c "${parts.filter(identity).join(' ')}"`;
  };

  const getTestCmd = (project, ci, watch) => {
    return [
      'yarn',
      `test:${project}`,
      `--watchAll=${watch}`,
      ci ? '--no-colors' : '--colors',
      ci ? '--reporters=jest-junit' : '',
    ].filter(identity);
  };

  desc('tests each project');
  task('all', ['test:api', 'test:web'], async () => {
    const CI = env('CI', 'false') === 'true';

    if (CI) {
      log('making root reports dir');
      const mkReportsDir = mkdir(['-p', 'reports'], {});
      await mkReportsDir.promise;

      log('copying project reports to root reports dir');
      const cpApiReports = cp(['-R', 'api/reports/*', 'reports'], { shell: true });
      const cpWebReports = cp(['-R', 'web/reports/*', 'reports'], { shell: true });
      await Promise.all([cpApiReports.promise, cpWebReports.promise]);
    }
  });

  desc('tests the api project');
  task('api', ['build:docker'], async () => {
    const WATCH = env('WATCH', 'false') === 'true';
    const CI = env('CI', 'false') === 'true';

    const runTests = async () => {
      const test = dockerCompose(
        ['-f', 'docker-compose.api.test.yml', 'run', '--rm', 'test', bashC(...getTestCmd(PROJECTS.api, CI, WATCH))],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
      try {
        await test.promise;
        log(chalk.green('api tests succeeded'));
      } catch (err) {
        log(chalk.red('api tests failed'));
        throw err;
      }
    };

    const cleanupTests = async () => {
      const down = dockerCompose(['-f', 'docker-compose.api.test.yml', 'down', '--remove-orphans'], {
        stdio: 'inherit',
      });
      await down.promise;
    };

    try {
      await runTests();
    } finally {
      await cleanupTests();
    }
  });

  desc('tests the web project');
  task('web', ['build:docker'], async () => {
    const WATCH = env('WATCH', 'false') === 'true';
    const CI = env('CI', 'false') === 'true';

    const runTests = async () => {
      const test = dockerCompose(
        ['-f', 'docker-compose.web.test.yml', 'run', '--rm', 'test', bashC(...getTestCmd(PROJECTS.web, CI, WATCH))],
        { stdio: 'inherit', shell: true }
      );
      try {
        await test.promise;
        log(chalk.green('web tests succeeded'));
      } catch (err) {
        log(chalk.red('web tests failed'));
        throw err;
      }
    };

    const cleanupTests = async () => {
      const down = dockerCompose(['-f', 'docker-compose.web.test.yml', 'down', '--remove-orphans'], {
        stdio: 'inherit',
      });
      await down.promise;
    };

    try {
      await runTests();
    } finally {
      await cleanupTests();
    }
  });
});

desc('brings down all the projects');
task('down', [], async () => {
  const DOCKER_COMPOSE_FILE = env('DOCKER_COMPOSE_FILE', 'docker-compose.yml');

  const down = dockerCompose(['-f', DOCKER_COMPOSE_FILE, 'down']);
  await down.promise;
});

desc('generates the local-only files needed for development');
task('gensecrets', [], async () => {
  const secretsFilepath = path.join(__dirname, 'env', 'secrets.env');
  const secretsTemplateFilepath = path.join(__dirname, 'templates', 'secrets.template.env');

  if (fs.existsSync(secretsFilepath)) {
    log(chalk.red(`secrets file already exists, skipping: ${secretsFilepath}`));
  } else {
    log('secrets file does not exist, copying secrets file from template');
    const copy = cp([secretsTemplateFilepath, secretsFilepath]);
    await copy.promise;
  }
});

desc('logs into the dev database');
task('db', [], async () => {
  const dockerComposeDb = dockerCompose(['-f', './docker-compose.yml', 'exec', 'db', 'psql', '-U', 'stringsync'], {
    cwd: 'api',
    stdio: 'inherit',
  });
  await dockerComposeDb.promise;
});

desc('shows the logs for the dev containers');
task('logs', [], async () => {
  const dockerComposeLogs = dockerCompose(['-f', './docker-compose.yml', 'logs', '-f'], {
    cwd: 'api',
    stdio: 'inherit',
  });
  await dockerComposeLogs.promise;
});

desc('deploys the app');
task('deploy', [], async () => {
  const BUMP_FLAGS = {
    PATCH: '--patch',
    MINOR: '--minor',
    MAJOR: '--major',
  };

  const BUMP = env('BUMP', 'PATCH');
  const BRANCH = env('BRANCH', 'master');

  const flag = BUMP_FLAGS[BUMP];

  if (!flag) {
    throw new Error(`unknown bump env: ${BUMP}`);
  }

  log('bumping api version');
  const yarnVersionApi = yarn(['version', flag, '--no-git-tag-version'], { cwd: 'api' });
  await yarnVersionApi.promise;

  log('bumping web version');
  const yarnVersionWeb = yarn(['version', flag, '--no-git-tag-version'], { cwd: 'web' });
  await yarnVersionWeb.promise;

  const add = git(['add', 'api/package.json', 'web/package.json']);
  await add.promise;

  const commit = git(['commit', '-m', 'Bump app versions.'], { stdio: 'inherit' });
  await commit.promise;

  const pushOrigin = git(['push', 'origin'], { stdio: 'inherit' });
  await pushOrigin.promise;

  const pushAws = git(['push', 'aws', `${BRANCH}:master`], { stdio: 'inherit' });
  await pushAws.promise;
});

namespace('cf', () => {
  const S3_BUCKET = env('S3_BUCKET', 'stringsync-cf-templates');
  const SRC_DIR = env('SRC_DIR', 'aws/cloudformation');
  const DST_DIR = env('DST_DIR', new Date().toISOString());
  const ROOT_FILENAME = env('ROOT_FILE', 'cloudformation.yml');
  const DIR_STRING_TEMPLATE = env('DIR_STRING_TEMPLATE', '{{STRINGSYNC_DIR_STRING}}');

  desc('syncs the cloudformation templates to s3');
  task('sync', ['cf:validate'], async () => {
    // Replace the DIR_STRING_TEMPLATE with the s3 directory name.
    const dstDirName = encodeURIComponent(DST_DIR);
    const rootFile = fs.readFileSync(path.join(__dirname, SRC_DIR, ROOT_FILENAME));
    const rootFileStr = rootFile.toString().replace(DIR_STRING_TEMPLATE, dstDirName);
    const rootPath = path.join(__dirname, 'tmp', ROOT_FILENAME);

    // Ensure a tmp folder is made.
    await mkdir(['-p', 'tmp']).promise;

    try {
      // Create the tmp root file.
      fs.writeFileSync(rootPath, rootFileStr);

      // Try to copy the root file and all the files that support it into s3.
      const cpRoot = aws(['s3', 'cp', rootPath, `s3://${S3_BUCKET}/${DST_DIR}/${ROOT_FILENAME}`]);
      const cpNested = aws([
        's3',
        'cp',
        SRC_DIR,
        `s3://${S3_BUCKET}/${DST_DIR}`,
        '--recursive',
        '--exclude',
        ROOT_FILENAME,
      ]);
      await Promise.all([cpRoot.promise, cpNested.promise]);

      // Give the user a friendly link to look at the uploaded files.
      const dirUrl = `https://s3.console.aws.amazon.com/s3/buckets/${S3_BUCKET}?region=us-east-1&prefix=${DST_DIR}/`;
      const rootUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${DST_DIR}/${ROOT_FILENAME}`;
      log(chalk.green(`folder: ${dirUrl}`));
      log(chalk.green(`root: ${rootUrl}`));
    } catch (e) {
      // On failure, remove the entire dir since we cannot assume it has everything it needs.
      log(chalk.red(`something went wrong, deleting dir: ${e}`));
      await aws(['s3', 'rm', `s3://${S3_BUCKET}/${DST_DIR}`, '--recursive']).promise;
    } finally {
      await rm([rootPath]).promise;
    }
  });

  desc('validates all cloudformation templates');
  task('validate', [], async () => {
    const files = fs.readdirSync(SRC_DIR);
    const failures = [];
    await Promise.allSettled(
      files.map((file) => {
        const validate = aws(['cloudformation', 'validate-template', '--template-body', `file://${SRC_DIR}/${file}`]);
        return validate.promise.catch((e) => {
          failures.push(file);
        });
      })
    );

    if (failures.length > 0) {
      log(chalk.red(`validate failed for files: ${failures.join(', ')}`));
    } else {
      log(chalk.green(`validate succeeded!`));
    }
  });

  desc('removes all templates in the templates s3 bucket');
  task('prune', [], async () => {
    const rm = aws(['s3', 'rm', `s3://${S3_BUCKET}`, '--recursive']);
    await rm.promise;
  });
});
