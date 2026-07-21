// Storybook-toned loading state so the cream cover doesn't flash dark
const LoadingPage = () => (
  <div className="flex min-h-dvh items-center justify-center bg-[#ede6e1]">
    <p className="text-sm uppercase tracking-[0.3em] text-[#8c0707]">Opening…</p>
  </div>
);

export default LoadingPage;
