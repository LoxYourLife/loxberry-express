const fs = require('fs').promises;

const read = async (fileName) => {
  const fileHandle = await fs.open(fileName, 'r');
  let fileContent;
  try {
    const fileBuffer = (await fileHandle.readFile()).toString();
    fileContent = fileBuffer.toString('utf-8');
  } finally {
    fileHandle.close();
  }
  return fileContent;
};

const readJson = async (fileName) => {
  const content = await read(fileName);
  return JSON.parse(content);
};

const write = async (fileName, content, mode = 'w+') => {
  const fileHandle = await fs.open(fileName, mode);
  try {
    await fileHandle.writeFile(content, 'UTF-8');
  } finally {
    fileHandle.close();
  }
};

const writeJson = async (fileName, content, mode = 'w+') => write(fileName, JSON.stringify(content), mode);

module.exports = {
  read,
  readJson,
  write,
  writeJson
};
