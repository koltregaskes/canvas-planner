const os = require('os');
const path = require('path');

const APP_NAME = 'Canvas Planner';
const APP_SLUG = 'canvas-planner';
const REPO_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const REPO_DATA_FILE = path.join(REPO_ROOT, 'data', 'tasks.json');
const PUBLIC_PREVIEW_DATA_FILE = path.join(PUBLIC_DIR, 'data', 'tasks.json');

function resolveRuntimeDataFile(env = process.env) {
  const explicitFile = env.CANVAS_PLANNER_DATA_FILE && env.CANVAS_PLANNER_DATA_FILE.trim();
  if (explicitFile) {
    return {
      dataFile: path.resolve(explicitFile),
      storageMode: 'custom-file',
    };
  }

  const explicitDir = env.CANVAS_PLANNER_DATA_DIR && env.CANVAS_PLANNER_DATA_DIR.trim();
  if (explicitDir) {
    return {
      dataFile: path.join(path.resolve(explicitDir), 'tasks.json'),
      storageMode: 'custom-dir',
    };
  }

  const myDataDir = env.MYDATA_DIR && env.MYDATA_DIR.trim();
  if (myDataDir) {
    return {
      dataFile: path.join(path.resolve(myDataDir), APP_SLUG, 'tasks.json'),
      storageMode: 'mydata-dir',
    };
  }

  const localAppData = env.LOCALAPPDATA && env.LOCALAPPDATA.trim();
  if (localAppData) {
    return {
      dataFile: path.join(path.resolve(localAppData), 'MyData', APP_SLUG, 'tasks.json'),
      storageMode: 'localappdata-mydata',
    };
  }

  return {
    dataFile: path.join(os.homedir(), '.local', 'share', APP_SLUG, 'tasks.json'),
    storageMode: 'user-home',
  };
}

function createConfig(env = process.env) {
  const runtime = resolveRuntimeDataFile(env);
  const parsedPort = Number.parseInt(env.PORT, 10);

  return {
    appName: APP_NAME,
    appSlug: APP_SLUG,
    host: env.HOST || '0.0.0.0',
    port: Number.isNaN(parsedPort) ? 3000 : parsedPort,
    repoRoot: REPO_ROOT,
    publicDir: PUBLIC_DIR,
    seedDataFile: REPO_DATA_FILE,
    previewDataFile: PUBLIC_PREVIEW_DATA_FILE,
    dataFile: runtime.dataFile,
    storageMode: runtime.storageMode,
  };
}

module.exports = {
  APP_NAME,
  APP_SLUG,
  createConfig,
};
