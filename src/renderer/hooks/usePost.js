import { useCallback, useEffect, useMemo, useState } from 'react';
import { useJournalsContext } from 'renderer/context/JournalsContext';
import * as fileOperations from '../utils/fileOperations';
import { useIndexContext } from 'renderer/context/IndexContext';
import {
  getPost,
  cycleColorCreator,
  tagActionsCreator,
  attachToPostCreator,
  detachFromPostCreator,
  setHighlightCreator,
} from './usePostHelpers';

const highlightColors = [
  'var(--border)',
  'var(--base-yellow)',
  'var(--base-green)',
];

const defaultPost = {
  content: '',
  data: {
    title: '',
    createdAt: null,
    updatedAt: null,
    highlight: null,
    highlightColor: null,
    tags: [],
    replies: [],
    attachments: [],
    isReply: false,
    isAI: false,
  },
};

function usePost(
  postPath = null, // relative path
  {
    isReply = false,
    isAI = false,
    parentPostPath = null, // relative path
    reloadParentPost = () => {},
  } = {}
) {
  const { currentJournal, getCurrentJournalPath } = useJournalsContext();
  const { addIndex, removeIndex, refreshIndex, updateIndex, prependIndex } =
    useIndexContext();
  const [updates, setUpdates] = useState(0);
  const [path, setPath] = useState(); // absolute path
  const [post, setPost] = useState({ ...defaultPost });

  useEffect(() => {
    if (!postPath) return;
    const getFullPath = async () => {
      const journalPath = await getCurrentJournalPath();
      const result = await window.electron.path.join(journalPath, postPath);
      if (result.success) {
        setPath(result.data);
      }
    };
    getFullPath();
  }, [postPath, currentJournal]);

  useEffect(() => {
    if (!path) return;
    refreshPost();
  }, [path]);

  const refreshPost = useCallback(async () => {
    if (!path) return;
    const freshPost = await getPost(path);
    setPost(freshPost);
  }, [path]);

  const savePost = useCallback(
    async (dataOverrides) => {
      console.time('post-time');

      const saveToPath = path
        ? path
        : await fileOperations.getFilePathForNewPost(currentJournal.path);
      const directoryPath = await fileOperations.getDirectoryPath(saveToPath);
      const now = new Date().toISOString();
      const content = post.content;
      const data = {
        ...post.data,
        isAI: post.data.isAI === true ? post.data.isAI : isAI,
        isReply: post.data.createdAt ? post.data.isReply : isReply,
        createdAt: post.data.createdAt ?? now,
        updatedAt: now,
        ...dataOverrides,
      };

      try {
        const fileContents = await fileOperations.generateMarkdown(
          content,
          data
        );

        await fileOperations.createDirectory(directoryPath);
        await fileOperations.saveFile(saveToPath, fileContents);

        if (isReply) {
          await addReplyToParent(parentPostPath, saveToPath);
        }

        const sepResult = await window.electron.path.separator();
        const sep = sepResult.success ? sepResult.data : '/';
        const journalPath = await getCurrentJournalPath();
        const postRelativePath = saveToPath.replace(
          journalPath + sep,
          ''
        );
        prependIndex(postRelativePath, data); // Add the file to the index
        addIndex(postRelativePath, parentPostPath); // Add the file to the index
        const updateResult = await window.electron.journals.updateFile(saveToPath, saveToPath);
        if (updateResult.success) {
          // Sync tags via IPC
          window.electron.ipc.sendMessage('tags-sync', saveToPath);
        }
        console.timeEnd('post-time');
      } catch (error) {
        console.error(`Error writing file: ${saveToPath}`);
        console.error(error);
      }
    },
    [path, post, reloadParentPost]
  );

  const addReplyToParent = async (parentPostPath, replyPostPath) => {
    const pathArr = replyPostPath.split(/[/\\]/).slice(-3);
    const joinResult = await window.electron.path.join(...pathArr);
    if (!joinResult.success) return;
    
    const relativeReplyPath = joinResult.data;
    const fullParentPostPath = getCurrentJournalPath(parentPostPath);
    const parentPost = await getPost(fullParentPostPath);
    const content = parentPost.content;
    const data = {
      ...parentPost.data,
      replies: [...parentPost.data.replies, relativeReplyPath],
    };
    const fileContents = await fileOperations.generateMarkdown(content, data);
    await fileOperations.saveFile(fullParentPostPath, fileContents);
    updateIndex(parentPostPath, data);
    reloadParentPost(parentPostPath);
  };

  const deletePost = useCallback(async () => {
    if (!postPath) return null;
    const fullPostPath = await getCurrentJournalPath(postPath);

    // if reply, remove from parent
    if (post.data.isReply && parentPostPath) {
      const fullParentPostPath = await getCurrentJournalPath(parentPostPath);
      const parentPost = await getPost(fullParentPostPath);
      const content = parentPost.content;
      const newReplies = parentPost.data.replies.filter((p) => {
        return p !== postPath;
      });
      const data = {
        ...parentPost.data,
        replies: newReplies,
      };
      const fileContents = await fileOperations.generateMarkdown(content, data);
      await fileOperations.saveFile(fullParentPostPath, fileContents);
      await reloadParentPost();
    }

    // delete file and remove from index
    await fileOperations.deleteFile(fullPostPath);
    removeIndex(postPath);
  }, [postPath, reloadParentPost, parentPostPath, post]);

  const postActions = useMemo(
    () => ({
      setContent: (content) => setPost((post) => ({ ...post, content })),
      updateData: (data) =>
        setPost((post) => ({ ...post, data: { ...post.data, ...data } })),
      cycleColor: cycleColorCreator(post, setPost, savePost, highlightColors),
      setHighlight: setHighlightCreator(post, setPost, savePost),
      addTag: tagActionsCreator(setPost, 'add'),
      removeTag: tagActionsCreator(setPost, 'remove'),
      attachToPost: attachToPostCreator(setPost, getCurrentJournalPath),
      detachFromPost: detachFromPostCreator(setPost, getCurrentJournalPath),
      resetPost: () => setPost(defaultPost),
    }),
    [post]
  );

  return {
    defaultPost,
    post,
    savePost,
    refreshPost,
    deletePost,
    ...postActions,
  };
}

export default usePost;
