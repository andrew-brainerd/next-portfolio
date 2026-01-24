import { Suspense } from 'react';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import CreateExperienceGroupForm from '@/components/keiken/CreateExperienceGroupForm';
import ExperienceGroupsList from '@/components/keiken/ExperienceGroupsList';
import Loading from '@/components/Loading';

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
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Please log in to view your experience groups.</p>
      </div>
    );
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
