// Storybook-toned loading state so the cream cover doesn't flash dark
const LoadingPage = () => (
  <div className="storybook flex min-h-dvh items-center justify-center bg-[var(--sb-cream)]">
    <p className="font-garamond text-sm uppercase tracking-[0.3em] text-[var(--sb-crimson)]">Opening…</p>
  </div>
);

export default LoadingPage;
