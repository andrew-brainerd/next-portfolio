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
      className="group relative animate-fade items-center cursor-pointer flex flex-col justify-center p-8 transition-all duration-500 ease-out hover:scale-105 active:scale-95 rounded-3xl bg-gradient-to-br from-neutral-600/40 to-neutral-700/40 backdrop-blur-sm border border-neutral-500/20 shadow-lg hover:shadow-2xl hover:shadow-brand-500/20 hover:border-brand-400/40 overflow-hidden"
      title={name}
      aria-label={name}
      href={path}
      target={openNewTab ? '_blank' : '_self'}
      rel="noopener noreferrer"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-600/0 group-hover:from-brand-500/10 group-hover:to-brand-600/20 transition-all duration-500 rounded-3xl"></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 transform transition-transform duration-300 group-hover:-translate-y-1">
        {children || text || path}
      </div>

      {/* Label */}
      <span className="relative z-10 mt-4 text-sm font-medium text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {name}
      </span>
    </a>
  );
};

export default HomeLink;
