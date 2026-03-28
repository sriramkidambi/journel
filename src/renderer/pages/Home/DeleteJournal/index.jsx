import styles from './DeleteJournal.module.scss';
import { TrashIcon } from 'renderer/icons';
import { useJournalsContext } from '../../../context/JournalsContext';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function DeleteJournal({ journal }) {
  const { deleteJournal } = useJournalsContext();

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className={styles.deleteButton}>
          <TrashIcon className={styles.icon} />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.AlertDialogOverlay} />
        <AlertDialog.Content className={styles.AlertDialogContent}>
          <AlertDialog.Title className={styles.AlertDialogTitle}>
            Remove this journal?
          </AlertDialog.Title>
          <AlertDialog.Description className={styles.AlertDialogDescription}>
            This action removes the <b>{journal.name}</b> journal from the list,
            but it won't actually delete the journal's files stored at{' '}
            <b>{journal.path}</b> from your computer.
            <br />
            <br />
            You can delete or back up your journal folder, or import it back
            into Journal in the future.
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className={styles.cancelButton}>Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className={styles.confirmButton}
                onClick={() => {
                  deleteJournal(journal.name);
                }}
              >
                Yes, remove journal
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
