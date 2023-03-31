import HomeLink from 'components/HomeLink';
import GitHubIcon from 'components/icons/GitHubIcon';
import LinkedinIcon from 'components/icons/LinkedinIcon';
import MailIcon from 'components/icons/MailIcon';

import styles from 'styles/components/Home.module.scss';

export default function Home() {
  return (
    <div className={styles.app}>
      <main className={styles.home}>
        <h1>
          {'Andrew J Brainerd'.split(' ').map((word, w) => (
            <div key={w} className={styles.word}>
              {word}
            </div>
          ))}
        </h1>
        <div className={styles.links}>
          <HomeLink name="GitHub" path="https://github.com/andrew-brainerd">
            <GitHubIcon />
          </HomeLink>
          <HomeLink name="LinkedIn" path={'https://www.linkedin.com/in/andrewbrainerd3'}>
            <LinkedinIcon />
          </HomeLink>
          <HomeLink name="Email" path={'mailto:drwb333@gmail.com'}>
            <MailIcon />
          </HomeLink>
        </div>
      </main>
    </div>
  );
}
