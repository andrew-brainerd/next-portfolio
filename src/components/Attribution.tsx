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

export const Attribution = () => {
  return (
    <div>
      <h2>Icons Made By</h2>
      {iconCreators.map(({ authorLink, authorName }) => {
        return (
          <div key={authorName} className="m-0">
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
