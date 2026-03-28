import styles from './OpenJournalFolder.module.scss';
import { FolderIcon } from 'renderer/icons';

export default function OpenJournalFolder({ journal }) {
  const handleClick = () => {
    window.electron.openFolder(journal.path);
  };

  return (
    <button className={styles.button} onClick={handleClick}>
      <FolderIcon className={styles.icon} />
    </button>
  );
}
