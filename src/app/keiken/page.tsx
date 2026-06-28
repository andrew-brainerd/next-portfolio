import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { KEIKEN_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import { CreateExperienceGroupForm } from '@/components/keiken/CreateExperienceGroupForm';
import { ExperienceGroupsList } from '@/components/keiken/ExperienceGroupsList';
import { Loading } from '@/components/Loading';

function ExperienceGroupsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Loading />
      <p className="mt-4 text-gray-400">Loading experience groups...</p>
    </div>
  );
}

export default async function KeikenPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;

  if (!token || !userId) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(KEIKEN_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Experience Groups</h1>
        <CreateExperienceGroupForm userId={userId} />
      </div>

      <Suspense fallback={<ExperienceGroupsLoading />}>
        <ExperienceGroupsList userId={userId} />
      </Suspense>
    </div>
  );
}
