/**
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */


const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');

const babel = require('babel-core');
const chalk = require('chalk');
const micromatch = require('micromatch');

const getPackages = require('./_getPackages');

const SRC_DIR = 'server_src';
const BUILD_DIR = 'server_build';
const BUILD_ES5_DIR = 'build-es5';
const JS_FILES_PATTERN = '**/*.js?(x)';
const IGNORE_PATTERN = '(**/__tests__/**)|(**/*~)';
const PACKAGES_DIR = path.resolve(__dirname, '../packages');

const babelNodeOptions = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '.babelrc'), 'utf8'));
babelNodeOptions.babelrc = false;
const babelEs5Options = Object.assign(
  {},
  babelNodeOptions,
  { presets: 'env' },
  { plugins: [...babelNodeOptions.plugins, 'transform-runtime'] },
);

const fixedWidth = (str) => {
  const WIDTH = 80;
  const strs = str.match(new RegExp(`(.{1,${WIDTH}})`, 'g'));
  let lastString = strs[strs.length - 1];
  if (lastString.length < WIDTH) {
    lastString += Array(WIDTH - lastString.length).join(chalk.dim('.'));
  }
  return strs.slice(0, -1).concat(lastString).join('\n');
};

function getPackageName(file) {
  return path.relative(PACKAGES_DIR, file).split(path.sep)[0];
}

function getBuildPath(file, buildFolder) {
  const pkgName = getPackageName(file);
  const pkgSrcPath = path.resolve(PACKAGES_DIR, pkgName, SRC_DIR);
  const pkgBuildPath = path.resolve(PACKAGES_DIR, pkgName, buildFolder);
  const relativeToSrcPath = path.relative(pkgSrcPath, file).replace(/\.jsx$/, '.js');
  return path.resolve(pkgBuildPath, relativeToSrcPath);
}

function buildFileFor(file, silent, env) {
  const buildDir = env === 'es5' ? BUILD_ES5_DIR : BUILD_DIR;
  const destPath = getBuildPath(file, buildDir);
  const babelOptions = env === 'es5' ? babelEs5Options : babelNodeOptions;

  if (micromatch.isMatch(file, IGNORE_PATTERN)) {
    if (!silent) {
      process.stdout.write(
        `${chalk.dim('  \u2022 ') +
          path.relative(PACKAGES_DIR, file)} (ignore)\n`,
      );
    }
    return;
  }

  mkdirp.sync(path.dirname(destPath));
  if (!micromatch.isMatch(file, JS_FILES_PATTERN)) {
    fs.createReadStream(file).pipe(fs.createWriteStream(destPath));
    if (!silent) {
      process.stdout.write(
        `${chalk.red('  \u2022 ') +
          path.relative(PACKAGES_DIR, file) +
          chalk.red(' \u21D2 ') +
          path.relative(PACKAGES_DIR, destPath)} (copy)\n`,
      );
    }
  } else {
    const transformed = babel.transformFileSync(file, babelOptions).code;
    fs.writeFileSync(destPath, transformed);
    if (!silent) {
      process.stdout.write(
        `${chalk.green('  \u2022 ') +
          path.relative(PACKAGES_DIR, file) +
          chalk.green(' \u21D2 ') +
          path.relative(PACKAGES_DIR, destPath)}\n`,
      );
    }
  }
}

function buildFile(file, silent) {
  buildFileFor(file, silent, 'node');

  const pkgJsonPath = path.resolve(
    PACKAGES_DIR,
    getPackageName(file),
    'package.json',
  );
  const { browser } = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (browser) {
    if (browser.indexOf(BUILD_ES5_DIR) !== 0) {
      throw new Error(
        `browser field for ${pkgJsonPath} should start with "${BUILD_ES5_DIR}"`,
      );
    }
    buildFileFor(file, silent, 'es5');
  }
}

function buildPackage(p) {
  const pkgJsonPath = path.resolve(p, 'package.json');
  // If the package specified `build` task in package.json. just execute it

  const srcDir = path.resolve(p, SRC_DIR);
  const pattern = path.resolve(srcDir, '**/*');
  const files = glob.sync(pattern, { nodir: true });

  process.stdout.write(fixedWidth(`${path.basename(p)}\n`));

  files.forEach(file => buildFile(file, true));
  process.stdout.write(`[  ${chalk.green('OK')}  ]\n`);
}

const packages = process.argv.slice(2);

if (packages.length) {
  packages.forEach(buildPackage);
} else {
  process.stdout.write(chalk.bold.inverse('Building packages\n'));
  getPackages().forEach(buildPackage);
  process.stdout.write('\n');
}
