import Link from 'next/link';
import { getExperienceGroups } from '@/api/keiken';

interface ExperienceGroupsListProps {
  userId: string;
}

export default async function ExperienceGroupsList({ userId }: ExperienceGroupsListProps) {
  const experienceGroups = await getExperienceGroups(userId);

  if (!experienceGroups || experienceGroups.length === 0) {
    return <p className="text-gray-400">No experience groups found.</p>;
  }

  return (
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
  );
}
