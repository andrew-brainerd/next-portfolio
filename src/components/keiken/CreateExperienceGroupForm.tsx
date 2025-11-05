'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExperienceGroup } from '@/api/keiken';

interface CreateExperienceGroupFormProps {
  userId: string;
}

export default function CreateExperienceGroupForm({ userId }: CreateExperienceGroupFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createExperienceGroup({
        name,
        description,
        createdBy: userId
      });

      // Reset form
      setName('');
      setDescription('');
      setIsOpen(false);

      // Refresh the page to show the new group
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experience group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        type="button"
      >
        Create New Experience Group
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Experience Group</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500 min-h-24"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError('');
                    setName('');
                    setDescription('');
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
