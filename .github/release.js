/**
 * Release Script - the main purpose is to automate the release process that you don't forget to change a file.
 * This tool requires a package.json in the root folder including optional config and some required modules.
 * 
 * The required devDependencies are:
 * {
 *    "prompts": "2.4.2",
 *    "read-ini-file": "3.0.1",
 *    "write-ini-file": "3.0.2",
 *    "generate-changelog": "1.8.0"
 * }
 * 
 * When you don't have a plugin.json, create one by calling `npm init`.
 * The script will first check for a clean git environment and config issues and in case everything is fine it bumps up 
 * a version like major, minor or patch, show you the new version and ask for permission to continue.
 * If agreed, the plugin.cfg and either the release.cfg or prerelease.cfg are changed accordingly.
 * 
 * After that a git status screen is shown to show the changes and again, the script asks for permission.
 * If granted, the script will commit the changes, create a tag and push everything to the upstream.
 * If denied, all the files will be reset.
 * 
 * You're done.
 * 
 * You have also the possibilities for hooking into the script.
 * 1. additional node modules and package.json files, maybe in bin
 * 2. some custom commands you need to run to make a build.
 * 
 * Those parameters will be placed in the root package.json file.
 * {
 *    "config": {
 *      "release": {
 *        "additionalNodeModules": ["bin"], // will let the script know, that there is a package.json in ./bin/
 *      },
 *      "additionalCommands": [
 *        {
 *          "command": "npm run build", // the command to execute
 *          "gitFiles": "webfrontend templates" // a list of files separated by space that git knows which files to add or restore.
 *        }
 *      ]
 *    }
 * } 
 *
 */

const prompts = require('prompts');

const readIniFile = require('read-ini-file');
const writeIniFile = require('write-ini-file');
const path = require('path');
const { execSync } = require('child_process');

const question = async (message) => {
  const answer = await prompts({ type: 'confirm', name: 'answer', message });
  return answer.answer;
};

const updatePluginConfig = async (version) => {
  const pluginCfg = path.resolve(__dirname, '..', 'plugin.cfg');
  const plugin = await readIniFile(pluginCfg);
  plugin.PLUGIN.VERSION = version;
  await writeIniFile(pluginCfg, plugin);
};

const updateReleaseCfg = async (version, url) => {
  const releaseCfg = path.resolve(__dirname, '..', 'release.cfg');
  const release = await readIniFile(releaseCfg);
  release.AUTOUPDATE.VERSION = version;
  release.AUTOUPDATE.ARCHIVEURL = `${url}/archive/${version}.zip`;
  await writeIniFile(releaseCfg, release);
};
const updatePreReleaseCfg = async (version, url) => {
  const releaseCfg = path.resolve(__dirname, '..', 'prerelease.cfg');
  const release = await readIniFile(releaseCfg);
  release.AUTOUPDATE.VERSION = version;
  release.AUTOUPDATE.ARCHIVEURL = `${url}/archive/${version}-rc.zip`;
  await writeIniFile(releaseCfg, release);
};

const updateNpm = ({ version, prefix, isPrerelease }) => {
  prefix = prefix ? ` --prefix ${prefix}` : '';
  const preid = isPrerelease ? ' --preid rc' : '';
  const command = `npm${prefix}${preid} --no-git-tag-version version ${version}`;
  try {
    execSync(command).toString();
  } catch (e) {
    console.error(e.message);
  }
};

const gitStatus = () => execSync('git status', { stdio: 'inherit' });
const gitReset = (files, staged) => execSync(`git restore ${staged ? '--staged ' : ''}${files.join(' ')}`);

const commit = async (version, isPrerelease, config) => {
  execSync('git add CHANGELOG.md');
  execSync('git add templates webfrontend');
  execSync('git add package.json package-lock.json');
  execSync('git add plugin.cfg');
  if (isPrerelease) {
    execSync('git add prerelease.cfg');
  } else {
    execSync('git add release.cfg');
  }

  config.additionalNodeModules.forEach((module) => execSync(`git add ${module}/package.json ${module}/package-lock.json`));
  config.additionalCommands.forEach((command) => execSync(`git add ${command.gitFiles}`));

  gitStatus();
  const ok = await question('Does this look right?');
  if (!ok) {
    console.log('Ok, resetting all changes');
    const files = [
      'CHANGELOG.md',
      'package.json',
      'package-lock.json',
      'plugin.cfg',
      isPrerelease ? 'prerelease.cfg' : 'release.cfg',
      ...config.additionalCommands.map((command) => command.gitFiles),
      ...config.additionalNodeModules
    ];
    gitReset(files, true);
    gitReset(files);
    process.exit(1);
  }

  const tagName = isPrerelease ? `${version}-rc` : version;
  console.log(`generating commit: type(ci): Version ${version}`);
  execSync(`git commit -m "type(ci): Version ${version}"`);
  console.log('creating tag ', tagName);
  execSync(`git tag ${tagName}`);
  execSync('git push --set-upstream origin main');
  execSync('git push origin --tags');
};

const generateChangelog = (version) => {
  let args = '';
  switch (version) {
    case 'major':
      args = '-M -a';
      break;
    case 'minor':
      args = '-m -a';
      break;
    case 'patch':
      args = '-p a';
      break;
  }
  execSync(`node_modules/.bin/changelog ${args}`);
};

const getPackage = () => {
  delete require.cache[require.resolve('../package.json')];
  const package = require('../package.json');
  return package;
};

const getGithubUrl = () => {
  try {
    const response = execSync('git remote get-url origin').toString().replace('\n', '');
    if (response.startsWith('git@')) {
      return response.replace(/^[a-z]+@([^:]+):([^\/]+)\/(.*).git/, 'https://$1/$2/$3');
    } else if (response.startsWith('http')) {
      return response.endsWith('.git') ? response.substring(0, response.length - 4) : response;
    }
    console.error('Cannot determine Github Url. Code only works for https or ssh repository urls');
  } catch (e) {
    console.error('Cannot determine Github Url, pease setup git.');
  }
  process.exit(1);
};

const isGitClean = () => {
  const response = execSync('git status --porcelain').toString();
  return response.replace('\n', '') === '';
};

const getConfig = () => {
  const package = getPackage();
  let additionalNodeModules = [];
  let additionalCommands = [];

  if (package.config && package.config.release && package.config.release.additionalNodeModules) {
    if (!Array.isArray(package.config.release.additionalNodeModules)) {
      console.log('Configuration Issue: config.release.additionalNodeModules should be an array');
      process.exit(1);
    }
    additionalNodeModules = package.config.release.additionalNodeModules;
  }
  if (package.config && package.config.release && package.config.release.additionalCommands) {
    if (!Array.isArray(package.config.release.additionalCommands)) {
      console.log('Configuration Issue: config.release.additionalCommands should be an array');
      process.exit(1);
    }
    additionalCommands = package.config.release.additionalCommands;
    const errors = additionalCommands.filter((command) => {
      if (typeof command !== 'object') return true;
      if (!command.command) return true;
      if (!command.gitFiles) return true;
    });

    if (errors.length > 0) {
      console.log(
        'Configuration Issue: config.release.additionalCommands should be an array containing an object with "command" and "gitFiles".'
      );
      process.exit(1);
    }
  }

  return { additionalCommands, additionalNodeModules };
};

const run = async () => {
  const newVersion = process.argv[2];
  const isPrerelease = process.argv[3] == 'true';

  const config = getConfig();

  if (!(await question(`Do you want to genrate a new ${isPrerelease ? 'Pre ' : ''}${newVersion} release?`))) {
    console.log('Ok, stopping');
    return '';
  }
  if (!isGitClean()) {
    gitStatus();
    console.log('\nYour local envorionment is not clean, you have some uncommited changes! Please commit them first\n');
    return;
  }

  const githubUrl = getGithubUrl();

  updateNpm({ version: newVersion, isPrerelease });
  const package = getPackage();
  const version = package.version;

  if (!(await question(`New Version will be ${version}! is that correct?`))) {
    console.log('Ok, stopping');
    gitReset(['package.json', 'package-lock.json']);
    return;
  }

  config.additionalNodeModules.forEach((module) => updateNpm({ version, prefix: module, isPrerelease }));

  console.log('updating plugin configs ...');

  await updatePluginConfig(version);
  if (isPrerelease) {
    await updatePreReleaseCfg(version, githubUrl);
  } else {
    await updateReleaseCfg(version, githubUrl);
  }

  console.log('generating changelog ...');
  generateChangelog(newVersion);
  console.log('generate new build');

  config.additionalCommands.forEach((command) => {
    execSync(command.command);
  });

  await commit(version, isPrerelease, config);
  console.log(`Created new Version: ${version}`);
};

run();
