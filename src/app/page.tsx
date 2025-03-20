import HomeLink from 'components/HomeLink';
import GitHubIcon from 'components/icons/GitHubIcon';
import LinkedinIcon from 'components/icons/LinkedinIcon';
import MangaIcon from 'components/icons/MangaIcon';
import MailIcon from 'components/icons/MailIcon';
import SteamIcon from 'components/icons/SteamIcon';

export default function Home() {
  return (
    <main className="text-center h-screen font">
      <div className="flex bg-[#9090ee] p-4 mb-12 justify-center border-b-white border-b-2">
        <h1 className="font-roboto tracking-tighter text-2xl sm:text-4xl">Andrew J. Brainerd</h1>
      </div>
      <div className="flex flex-col px-4">
        <h2 className="text-amber-400 text-2xl sm:text-4xl">Work</h2>
        <hr className="w-3/5 mx-auto my-4 border-amber-500 max-w-[550px]" />
        <div className="flex items-center flex-wrap justify-evenly mx-auto mt-6 gap-8 my-16 max-w-[800px]">
          <HomeLink name="GitHub" path="https://github.com/andrew-brainerd">
            <GitHubIcon className="fill-white sm:h-24 sm:w-24 w-16 h-16" />
          </HomeLink>
          <HomeLink name="LinkedIn" path="https://www.linkedin.com/in/andrewbrainerd3">
            <LinkedinIcon className="fill-white sm:h-24 sm:w-24 w-16 h-16" />
          </HomeLink>
          <HomeLink name="Email" path="mailto:andrew@brainerd.dev">
            <MailIcon className="fill-white sm:h-24 sm:w-24 w-16 h-16" />
          </HomeLink>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-amber-400 text-2xl sm:text-4xl">Play</h2>
        <hr className="w-3/5 mx-auto my-4 border-amber-500 max-w-[550px]" />
        <div className="flex items-center flex-wrap justify-evenly mx-auto mt-6 gap-8 gap-y-2 my-16 max-w-[800px]">
          <HomeLink name="Steam" path="/steam" openNewTab={false}>
            <SteamIcon className="fill-white sm:h-24 sm:w-24 w-16 h-16" />
          </HomeLink>
          <HomeLink name="Manga" path="/manga" openNewTab={false}>
            <MangaIcon className="fill-white sm:h-24 sm:w-24 w-16 h-16" />
          </HomeLink>
        </div>
      </div>
    </main>
  );
}
