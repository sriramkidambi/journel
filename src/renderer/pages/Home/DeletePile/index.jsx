import { useEffect, useState } from 'react';
import styles from './DeletePile.module.scss';
import { TrashIcon } from 'renderer/icons';
import { Link } from 'react-router-dom';
import { usePilesContext } from '../../../context/PilesContext';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function DeletePile({ pile }) {
  const { deletePile } = usePilesContext();

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
            This action removes the <b>{pile.name}</b> journal from the list,
            but it won't actually delete the journal's files stored at{' '}
            <b>{pile.path}</b> from your computer.
            <br />
            <br />
            You can delete or back up your journal folder, or import it back
            into Journel in the future.
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className={styles.cancelButton}>Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className={styles.confirmButton}
                onClick={() => {
                  deletePile(pile.name);
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
