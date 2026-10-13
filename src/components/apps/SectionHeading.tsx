interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
}

export const SectionHeading = ({ id, children }: SectionHeadingProps) => (
  <h2 id={id} className="mb-6 text-2xl font-bold text-brand-400 sm:text-3xl">
    {children}
  </h2>
);
