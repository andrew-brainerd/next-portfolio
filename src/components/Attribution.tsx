import styles from 'styles/components/Attribution.module.scss';

const iconCreators = [
  {
    authorName: 'Pixel perfect',
    authorLink: 'https://www.flaticon.com/authors/pixel-perfect'
  },
  {
    authorName: 'Freepik',
    authorLink: 'https://www.flaticon.com/authors/freepik'
  },
  {
    authorName: 'Those Icons',
    authorLink: 'https://www.flaticon.com/authors/those-icons'
  }
];

const Attribution = () => {
  return (
    <div className={styles.attribution}>
      <h2>Icons Made By</h2>
      {iconCreators.map(({ authorLink, authorName }) => {
        return (
          <div key={authorName} className={styles.author}>
            <a href={authorLink} title={authorName}>
              {authorName}
            </a>{' '}
            from
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default Attribution;
