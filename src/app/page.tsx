import { HomeLink } from 'components/HomeLink';
import { GitHubIcon } from 'components/icons/GitHubIcon';
import { LinkedinIcon } from 'components/icons/LinkedinIcon';
import { MailIcon } from 'components/icons/MailIcon';
import { SteamIcon } from 'components/icons/SteamIcon';

export default function HomePage() {
  return (
    <main className="text-[#9090ee] relative text-center h-screen top-1/5 text-6xl font">
      <h1 className="flex justify-center gap-x-2 my-10 font-roboto tracking-tighter">Andrew Brainerd</h1>
      <div className="flex items-center flex-wrap justify-evenly mx-auto my-16 max-w-[800px]">
        <HomeLink name="GitHub" path="https://github.com/andrew-brainerd">
          <GitHubIcon className="fill-[#ccc] sm:h-24 sm:w-24 w-16 h-16" />
        </HomeLink>
        <HomeLink name="LinkedIn" path="https://www.linkedin.com/in/andrewbrainerd3">
          <LinkedinIcon className="fill-[#ccc] sm:h-24 sm:w-24 w-16 h-16" />
        </HomeLink>
        <HomeLink name="Email" path="mailto:andrew@brainerd.dev">
          <MailIcon className="fill-[#ccc] sm:h-24 sm:w-24 w-16 h-16" />
        </HomeLink>
        <HomeLink name="Steam" path="/steam" openNewTab={false}>
          <SteamIcon className="fill-[#ccc] sm:h-24 sm:w-24 w-16 h-16" />
        </HomeLink>
      </div>
    </main>
  );
}
