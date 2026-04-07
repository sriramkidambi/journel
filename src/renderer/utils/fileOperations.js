const postFormat = {
  title: '',
  content: null,
  createdAt: null,
  updatedAt: null,
  attachments: [],
  color: null,
  area: null,
  tags: [],
  replies: [],
  isReply: false,
  isAI: false,
};

const getDirectoryPath = async (filePath) => {
  const isAbsolute = filePath.startsWith('/');
  const pathArr = filePath.split(/[/\\]/);
  pathArr.pop();
  const result = await window.electron.path.join(...pathArr);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to join path');
  }
  
  let directoryPath = result.data;

  if (isAbsolute && !directoryPath.startsWith('/')) {
    directoryPath = '/' + directoryPath;
  }

  return directoryPath;
};

const getFormattedTimestamp = () => {
  const currentDate = new Date();

  const year = String(currentDate.getFullYear()).slice(-2);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}.md`;

  return fileName;
};

const getFilePathForNewPost = async (basePath, timestamp = new Date()) => {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString();
  const fileName = getFormattedTimestamp();
  const result = await window.electron.path.join(basePath, year, month, fileName);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create file path');
  }
  
  return result.data;
};

const createDirectory = async (directoryPath) => {
  const result = await window.electron.file.mkdir(directoryPath);
  if (!result.success) {
    throw new Error(result.error || 'Failed to create directory');
  }
  return result.data;
};

const getFiles = async (dir) => {
  const result = await window.electron.journals.getFiles(dir);
  if (!result.success) {
    throw new Error(result.error || 'Failed to get files');
  }
  return result.data;
};

const saveFile = async (path, file) => {
  const result = await window.electron.file.write(path, file);
  if (!result.success) {
    throw new Error(result.error || 'Failed to write file');
  }
};

const deleteFile = async (path) => {
  const result = await window.electron.file.delete(path);
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete file');
  }
};

const generateMarkdown = async (content, data) => {
  const result = await window.electron.matter.stringify(content, data);
  if (!result.success) {
    throw new Error(result.error || 'Failed to stringify matter');
  }
  return result.data;
};

export {
  postFormat,
  createDirectory,
  saveFile,
  deleteFile,
  getFiles,
  getDirectoryPath,
  getFilePathForNewPost,
  generateMarkdown,
};
