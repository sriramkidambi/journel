import { useCallback, useEffect, useMemo, useState } from 'react';
import { useJournalsContext } from 'renderer/context/JournalsContext';
import * as fileOperations from '../utils/fileOperations';
import { getPost } from './usePostHelpers';

function useThread() {
  const { getCurrentJournalPath } = useJournalsContext();

  const getThread = useCallback(
    async (parentPostPath) => {
      if (!parentPostPath) return;
      let _thread = [];
      const fullPath = getCurrentJournalPath(parentPostPath);
      const freshPost = await getPost(fullPath);
      const replies = freshPost?.data?.replies || [];
      _thread.push(freshPost);

      for (const replyPath of replies) {
        const path = getCurrentJournalPath(replyPath);
        const reply = await getPost(path);
        _thread.push(reply);
      }

      return _thread;
    },
    [getCurrentJournalPath]
  );

  return {
    getThread,
  };
}

export default useThread;
