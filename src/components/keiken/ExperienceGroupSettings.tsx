'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateExperienceGroup } from '@/api/keiken';

interface ExperienceGroupSettingsProps {
  experienceGroupId: string;
  categories: string[];
}

export default function ExperienceGroupSettings({ experienceGroupId, categories }: ExperienceGroupSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryList, setCategoryList] = useState<string[]>(categories);
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categoryList.includes(trimmed)) {
      setCategoryList([...categoryList, trimmed]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategoryList(categoryList.filter(c => c !== categoryToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleSave = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await updateExperienceGroup(experienceGroupId, { categories: categoryList });
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update categories');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    setCategoryList(categories);
    setNewCategory('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
        type="button"
        title="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Experience Group Settings</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Categories</label>
              <p className="text-gray-400 text-sm mb-3">
                Add categories that can be assigned to experiences in this group.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="New category name"
                  className="flex-1 px-3 py-2 bg-brand-800 rounded border border-brand-600 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-400 rounded transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {categoryList.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No categories added yet</p>
                ) : (
                  categoryList.map(category => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 rounded-full text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
