import HomeLink from 'components/HomeLink';
import GitHubIcon from 'components/icons/GitHubIcon';
import LinkedinIcon from 'components/icons/LinkedinIcon';
import MangaIcon from 'components/icons/MangaIcon';
import MailIcon from 'components/icons/MailIcon';
import SteamIcon from 'components/icons/SteamIcon';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative container mx-auto px-6 py-14 sm:py-18 text-center">
          <div className="animate-fade-in-up">
            <h1 className="font-roboto font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl text-white mb-4 drop-shadow-lg">
              Andrew J. Brainerd
            </h1>
            <p className="text-blue-100 text-base sm:text-lg lg:text-xl font-light max-w-2xl mx-auto">
              Software Engineer & Pretty Nice Guy
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#191919] to-transparent"></div>
      </header>

      {/* Work Section */}
      <section className="py-10 px-6" aria-labelledby="work-heading">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 id="work-heading" className="text-brand-400 text-3xl sm:text-5xl font-bold mb-4">
              Work
            </h2>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
              Connect with me professionally and explore my work
            </p>
          </div>
          <nav
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto"
            aria-label="Work links"
          >
            <HomeLink name="GitHub Profile" path="https://github.com/andrew-brainerd">
              <GitHubIcon className="fill-white h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true" />
            </HomeLink>
            <HomeLink name="LinkedIn Profile" path="https://www.linkedin.com/in/andrewbrainerd3">
              <LinkedinIcon className="fill-white h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true" />
            </HomeLink>
            <HomeLink name="Send Email" path="mailto:andrew@brainerd.dev">
              <MailIcon className="fill-white h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true" />
            </HomeLink>
          </nav>
        </div>
      </section>

      {/* Play Section */}
      <section
        className="py-10 px-6 bg-gradient-to-b from-transparent to-neutral-800/20"
        aria-labelledby="play-heading"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 id="play-heading" className="text-brand-400 text-3xl sm:text-5xl font-bold mb-4">
              Play
            </h2>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto">Explore my gaming stats and manga collection</p>
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto" aria-label="Gaming links">
            <HomeLink name="Steam Gaming Stats" path="/steam" openNewTab={false}>
              <SteamIcon className="fill-white h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true" />
            </HomeLink>
            <HomeLink name="Manga Collection" path="/manga" openNewTab={false}>
              <MangaIcon className="fill-white h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true" />
            </HomeLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
