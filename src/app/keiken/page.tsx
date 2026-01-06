import { cookies } from 'next/headers';
import Link from 'next/link';

import { getExperienceGroups } from '@/api/keiken';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import CreateExperienceGroupForm from '@/components/keiken/CreateExperienceGroupForm';

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

  const experienceGroups = await getExperienceGroups(userId);

  console.log('Experience groups', experienceGroups);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Experience Groups</h1>
        <CreateExperienceGroupForm userId={userId} />
      </div>

      {!experienceGroups || experienceGroups.length === 0 ? (
        <p className="text-gray-400">No experience groups found.</p>
      ) : (
        <div className="grid gap-4">
          {experienceGroups.map(group => (
            <Link
              key={group.experienceGroupId}
              href={`/keiken/${group.experienceGroupId}`}
              className="bg-brand-600 rounded-lg p-6 hover:bg-brand-700 transition-colors block"
            >
              <h2 className="text-2xl font-semibold mb-2">{group.name}</h2>
              <p className="text-gray-300 mb-4">{group.description}</p>
              <div className="text-sm text-gray-400">
                <p>Created: {new Date(group.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(group.updatedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
