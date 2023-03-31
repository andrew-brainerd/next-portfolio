import styles from 'styles/components/HomeLink.module.scss';

interface HomeLinkProps {
  name: string;
  children?: React.ReactNode;
  text?: string;
  path?: string;
  openNewTab?: boolean;
}

const HomeLink = ({ name, children, text, path, openNewTab = true }: HomeLinkProps) => {
  return (
    <a
      className={styles.homeLink}
      title={name}
      aria-label={name}
      href={path}
      target={openNewTab ? '_blank' : '_self'}
      rel="noopener noreferrer"
    >
      {children || text || path}
    </a>
  );
};

export default HomeLink;
