import { useEffect, useState } from 'react';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import { useJournalsContext } from '../../context/JournalsContext';
import DeleteJournal from './DeleteJournal';
import Logo from './logo';
import OpenJournalFolder from './OpenJournalFolder';

const quotes = [
  'One moment at a time',
  'Scribe your soul',
  'Reflections reimagined',
  'Look back, leap forward!',
  'Tales of you - for every human is an epic in progress',
  'Your thoughtopia awaits',
  'The quintessence of quiet contemplation',
  'Journal jamboree',
];

export default function Home() {
  const { journals } = useJournalsContext();
  const [folderExists, setFolderExists] = useState(false);
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(quote);
  }, []);

  const renderJournals = () => {
    if (journals.length == 0)
      return (
        <div className={styles.noPiles}>
          No existing journals.
          <br />
          Start by creating a new journal.
        </div>
      );

    return journals.map((journal: any) => {
      return (
        <div
          className={`${journal.theme && journal.theme + 'Theme'} ${styles.pile}`}
          key={journal.path}
        >
          <div className={styles.left}>
            <div className={styles.name}>{journal.name}</div>
            {/* <div className={styles.src}>{journal.path}</div> */}
          </div>
          <div className={styles.right}>
            <DeleteJournal journal={journal} />
            <OpenJournalFolder journal={journal} />
            <Link to={`/journal/${journal.name}`} className={styles.button}>
              Open
            </Link>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={styles.frame}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.holder}>
            <div className={styles.iconHolder}>
              <Logo className={styles.icon} />
            </div>
            <div className={styles.name}>Journal</div>
          </div>
        </div>

        <Link to="/new-journal" className={styles.create}>
          Create a new journal →
        </Link>

        <div className={styles.or}>or open an existing journal</div>

        <div className={styles.piles}>{renderJournals()}</div>

        <div className={styles.footer}>
          <a href="https://integrofy.com" target="_blank" rel="noreferrer">
            <div className={styles.unms}></div>
            {quote}
          </a>

          <div className={styles.nav}>
            <Link to="/license" className={styles.link}>
              License
            </Link>
            <a
              href="https://integrofy.com"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              Tutorial
            </a>
            <a
              href="https://integrofy.com"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              Integrofy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
