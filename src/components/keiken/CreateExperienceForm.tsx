'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExperience } from '@/api/keiken';

interface CreateExperienceFormProps {
  experienceGroupId: string;
  userId: string;
}

export default function CreateExperienceForm({ experienceGroupId, userId }: CreateExperienceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createExperience(experienceGroupId, {
        title,
        description,
        date,
        location,
        notes,
        createdBy: userId
      });

      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setNotes('');
      setIsOpen(false);

      // Refresh the page to show the new experience
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsOpen(false);
    setError('');
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setNotes('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        type="button"
      >
        Add Experience
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-700 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Experience</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
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
                  className="w-full px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500 min-h-20"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  placeholder="e.g., January 2024"
                  className="w-full px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500 min-h-20"
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
                  onClick={resetForm}
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
