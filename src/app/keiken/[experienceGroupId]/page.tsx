import { cookies } from 'next/headers';
import Link from 'next/link';

import { getExperienceGroup, getExperiences } from '@/api/keiken';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import CreateExperienceForm from '@/components/keiken/CreateExperienceForm';
import ExperienceGroupSettings from '@/components/keiken/ExperienceGroupSettings';
import RatingStars from '@/components/keiken/RatingStars';

interface ExperienceGroupPageProps {
  params: Promise<{
    experienceGroupId: string;
  }>;
}

export default async function ExperienceGroupPage({ params }: ExperienceGroupPageProps) {
  const { experienceGroupId } = await params;
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;

  if (!token || !userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Please log in to view this experience group.</p>
      </div>
    );
  }

  const [experienceGroup, experiences] = await Promise.all([
    getExperienceGroup(experienceGroupId),
    getExperiences(experienceGroupId)
  ]);

  if (!experienceGroup) {
    return (
      <div className="container mx-auto p-6">
        <Link href="/keiken" className="text-brand-400 hover:text-brand-300 mb-4 inline-block">
          &larr; Back to Experience Groups
        </Link>
        <p className="text-white text-xl">Experience group not found.</p>
      </div>
    );
  }

  const categories = experienceGroup.categories || [];

  return (
    <div className="container mx-auto p-6">
      <Link href="/keiken" className="text-brand-400 hover:text-brand-300 mb-4 inline-block">
        &larr; Back to Experience Groups
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{experienceGroup.name}</h1>
          <p className="text-gray-300 mt-2">{experienceGroup.description}</p>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map(category => (
                <span key={category} className="px-2 py-1 bg-brand-600 rounded-full text-xs text-gray-300">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ExperienceGroupSettings experienceGroupId={experienceGroupId} categories={categories} />
          <CreateExperienceForm experienceGroupId={experienceGroupId} userId={userId} categories={categories} />
        </div>
      </div>

      {!experiences || experiences.length === 0 ? (
        <p className="text-gray-400">No experiences found in this group.</p>
      ) : (
        <div className="grid gap-4">
          {experiences.map(experience => (
            <div
              key={experience.experienceId}
              className="bg-brand-600 rounded-lg p-6 hover:bg-brand-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{experience.title}</h2>
                {experience.rating !== null && <RatingStars rating={experience.rating} readonly size="sm" />}
              </div>
              {experience.category && (
                <span className="inline-block px-2 py-1 bg-brand-500 rounded-full text-xs mb-2">
                  {experience.category}
                </span>
              )}
              {experience.description && <p className="text-gray-300 mb-2">{experience.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {experience.date && <p>Date: {experience.date}</p>}
                {experience.location && <p>Location: {experience.location}</p>}
              </div>
              {experience.notes && <p className="text-gray-400 mt-2 text-sm italic">{experience.notes}</p>}
              <div className="text-xs text-gray-500 mt-4">
                <p>Created: {new Date(experience.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
