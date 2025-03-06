interface HomeLinkProps {
  name: string;
  children?: React.ReactNode;
  text?: string;
  path?: string;
  openNewTab?: boolean;
}

export const HomeLink = ({ name, children, text, path, openNewTab = true }: HomeLinkProps) => {
  return (
    <a
      className="shadow animate-fade items-center bg-[#333333] rounded-2xl cursor-pointer flex justify-center p-4 px-5 transition-all duration-500 ease-in-out hover:scale-110"
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
