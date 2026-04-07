import {
  generateMarkdown,
  createDirectory,
  saveFile,
  deleteFile,
  getFilePathForNewPost,
  getDirectoryPath,
} from '../utils/fileOperations';

export const getPost = async (postPath) => {
  try {
    if (!postPath) return;
    const result = await window.electron.journals.getFile(postPath);
    if (!result.success || !result.data) return null;
    
    const fileContent = result.data;
    const parsedResult = await window.electron.matter.parse(fileContent);
    if (!parsedResult.success || !parsedResult.data) return null;
    
    const post = { content: parsedResult.data.content, data: parsedResult.data.data };
    return post;
  } catch (error) {
    // TODO: check and cleanup after these files
  }
};

export const attachToPostCreator =
  (setPost, getCurrentJournalPath) => async (imageData, fileExtension) => {
    const storePath = await getCurrentJournalPath();
    if (!storePath) return;

    let newAttachments = [];
    if (imageData) {
      // save image data to a file
      const result = await window.electron.journals.saveFile({
        fileData: imageData,
        fileExtension: fileExtension,
        storePath: storePath,
      });

      if (result.success && result.data) {
        newAttachments.push(result.data);
      } else {
        console.error('Failed to save the pasted image:', result.error);
      }
    } else {
      const openResult = await window.electron.journals.openFile({
        storePath: storePath,
      });
      if (openResult.success && openResult.data) {
        newAttachments = openResult.data;
      }
    }
    // Attachments are stored relative to the base path from the
    // base directory of the pile
    const correctedPaths = await Promise.all(newAttachments.map(async (path) => {
      const pathArr = path.split(/[/\\]/).slice(-4);
      const joinResult = await window.electron.path.join(...pathArr);
      return joinResult.success ? joinResult.data : path;
    }));

    setPost((post) => {
      const attachments = [...correctedPaths, ...post.data.attachments];
      const newPost = {
        ...post,
        data: { ...post.data, attachments },
      };

      return newPost;
    });
  };

export const detachFromPostCreator =
  (setPost, getCurrentJournalPath) => async (attachmentPath) => {
    setPost((post) => {
      let newPost = JSON.parse(JSON.stringify(post));
      const newAtt = newPost.data.attachments.filter(
        (a) => a !== attachmentPath
      );

      newPost.data.attachments = newAtt;
      
      // Delete the file asynchronously
      getCurrentJournalPath().then(async (journalPath) => {
        if (!journalPath) return;
        const joinResult = await window.electron.path.join(
          journalPath,
          attachmentPath
        );
        if (!joinResult.success) return;
        
        const fullPath = joinResult.data;
        const deleteResult = await window.electron.file.delete(fullPath);
        if (!deleteResult.success) {
          console.error('There was an error:', deleteResult.error);
        } else {
          console.log('File was deleted successfully');
        }
      });

      console.log('Attachment removed', attachmentPath);

      return newPost;
    });
  };

export const tagActionsCreator = (setPost, action) => {
  return (tag) => {
    setPost((post) => {
      if (action === 'add' && !post.data.tags.includes(tag)) {
        return {
          ...post,
          data: {
            ...post.data,
            tags: [...post.data.tags, tag],
          },
        };
      }
      if (action === 'remove' && post.data.tags.includes(tag)) {
        return {
          ...post,
          data: {
            ...post.data,
            tags: post.data.tags.filter((t) => t !== tag),
          },
        };
      }
      return post;
    });
  };
};

export const setHighlightCreator = (post, setPost, savePost) => {
  return (highlight) => {
    setPost((post) => ({
      ...post,
      data: { ...post.data, highlight: highlight },
    }));
    savePost({ highlight: highlight });
  };
};

export const cycleColorCreator = (post, setPost, savePost, highlightColors) => {
  return () => {
    if (!post.data.highlightColor) {
      const newColor = highlightColors[1];
      setPost((post) => ({
        ...post,
        data: { ...post.data, highlightColor: newColor },
      }));
      savePost({ highlightColor: newColor });
      return;
    }
    const currentColor = post.data.highlightColor;
    const currentIndex = highlightColors.findIndex(
      (color) => color === currentColor
    );
    const nextIndex = (currentIndex + 1) % highlightColors.length;
    const nextColor = highlightColors[nextIndex];

    setPost((post) => ({
      ...post,
      data: { ...post.data, highlightColor: nextColor },
    }));
    savePost({ highlightColor: nextColor });
  };
};
