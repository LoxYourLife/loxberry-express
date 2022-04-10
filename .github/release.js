const readIniFile = require('read-ini-file');
const writeIniFile = require('write-ini-file');
const path = require('path');
const { execSync } = require('child_process');

let version = process.argv[2];
const isPrerelease = process.argv[3] == 'true';

const updatePluginConfig = async () => {
  const pluginCfg = path.resolve(__dirname, '..', 'plugin.cfg');
  const plugin = await readIniFile(pluginCfg);
  plugin.PLUGIN.VERSION = version;
  await writeIniFile(pluginCfg, plugin);
};

const updateReleaseCfg = async (url) => {
  const releaseCfg = path.resolve(__dirname, '..', 'release.cfg');
  const release = await readIniFile(releaseCfg);
  release.AUTOUPDATE.VERSION = version;
  release.AUTOUPDATE.ARCHIVEURL = `${url}/archive/${version}.zip`;
  await writeIniFile(releaseCfg, release);
};
const updatePreReleaseCfg = async (url) => {
  const releaseCfg = path.resolve(__dirname, '..', 'prerelease.cfg');
  const release = await readIniFile(releaseCfg);
  release.AUTOUPDATE.VERSION = version;
  release.AUTOUPDATE.ARCHIVEURL = `${url}/archive/${version}-rc.zip`;
  await writeIniFile(releaseCfg, release);
};

const updateNpm = (prefix) => {
  prefix = prefix ? ` --prefix ${prefix}` : '';
  const preid = isPrerelease ? ' --preid rc' : '';
  const command = `npm ${prefix}${preid} --no-git-tag-version version ${version}`;
  try {
    execSync(command).toString();
  } catch (e) {
    console.error(e.message);
  }
};

const commit = () => {
  execSync('git add CHANGELOG.md');
  execSync('git add templates webfrontend');
  execSync('git add package.json package-lock.json');
  execSync('git add bin/package.json bin/package-lock.json');
  execSync('git add devServer/package.json devServer/package-lock.json');
  execSync('git add plugin.cfg');

  if (isPrerelease) {
    execSync('git add prerelease.cfg');
  } else {
    execSync('git add release.cfg');
  }

  const tagName = isPrerelease ? `${version}-rc` : version;
  execSync(`git commit -m "type(ci): Version ${version}"`);
  console.log('creating tag ', tagName);
  execSync(`git tag ${tagName}`);
  execSync('git push --set-upstream origin main');
  execSync('git push origin --tags');
};

const getVersion = () => {
  const package = require(path.resolve(__dirname, '..', 'package.json'));
  return package.version;
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

const run = async () => {
  const githubUrl = getGithubUrl();
  updateNpm();
  updateNpm('bin');
  updateNpm('devServer');
  version = getVersion();
  await updatePluginConfig();
  if (isPrerelease) {
    await updatePreReleaseCfg(githubUrl);
  } else {
    await updateReleaseCfg(githubUrl);
  }

  commit();
  console.log(`Created new Version: ${version}`);
};

run();
