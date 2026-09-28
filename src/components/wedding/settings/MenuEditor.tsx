'use client';

import { DIETARY_TAGS } from '@/constants/wedding';
import type { DietaryTag, MenuCourse, MenuItem, WeddingGuideConfig } from '@/types/wedding';
import { TextField } from './FormFields';
import { ListEditor } from './ListEditor';

interface DietaryTagPickerProps {
  tags: DietaryTag[];
  onChange: (tags: DietaryTag[]) => void;
}

const DietaryTagPicker = ({ tags, onChange }: DietaryTagPickerProps) => (
  <fieldset>
    <legend className="text-sm text-neutral-300">Dietary tags</legend>
    <div className="mt-1 flex flex-wrap gap-2">
      {DIETARY_TAGS.map(tag => {
        const active = tags.includes(tag.value);
        return (
          <button
            key={tag.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? tags.filter(t => t !== tag.value) : [...tags, tag.value])}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active
                ? 'border-brand-400 bg-brand-600/30 text-neutral-100'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
            }`}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  </fieldset>
);

interface CourseListEditorProps {
  courses: MenuCourse[];
  onChange: (courses: MenuCourse[]) => void;
  addLabel: string;
  titlePlaceholder: string;
}

const CourseListEditor = ({ courses, onChange, addLabel, titlePlaceholder }: CourseListEditorProps) => (
  <ListEditor
    items={courses}
    onChange={onChange}
    makeItem={(): MenuCourse => ({ title: '', items: [] })}
    addLabel={addLabel}
    itemLabel={index => courses[index]?.title || `Section ${index + 1}`}
    renderItem={(course, update) => (
      <div className="space-y-4">
        <TextField
          label="Title"
          value={course.title}
          onChange={title => update({ ...course, title })}
          placeholder={titlePlaceholder}
          maxLength={80}
        />
        <ListEditor
          items={course.items}
          onChange={items => update({ ...course, items })}
          makeItem={(): MenuItem => ({ name: '', tags: [] })}
          addLabel="Add item"
          itemLabel={index => `Item ${index + 1}`}
          renderItem={(item, updateItem) => (
            <div className="space-y-4">
              <TextField label="Name" value={item.name} onChange={name => updateItem({ ...item, name })} maxLength={120} />
              <TextField
                label="Description"
                value={item.description ?? ''}
                onChange={description => updateItem({ ...item, description })}
                maxLength={500}
              />
              <DietaryTagPicker tags={item.tags} onChange={tags => updateItem({ ...item, tags })} />
            </div>
          )}
        />
      </div>
    )}
  />
);

interface MenuEditorProps {
  menu: WeddingGuideConfig['menu'];
  onChange: (menu: WeddingGuideConfig['menu']) => void;
}

export const MenuEditor = ({ menu, onChange }: MenuEditorProps) => (
  <>
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Courses</h3>
      <CourseListEditor
        courses={menu.courses}
        onChange={courses => onChange({ ...menu, courses })}
        addLabel="Add course"
        titlePlaceholder="First course"
      />
    </div>
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Bar</h3>
      <CourseListEditor
        courses={menu.bar}
        onChange={bar => onChange({ ...menu, bar })}
        addLabel="Add bar section"
        titlePlaceholder="Signature cocktails"
      />
    </div>
    <TextField
      label="Menu note"
      value={menu.note ?? ''}
      onChange={note => onChange({ ...menu, note })}
      placeholder="Tell your server about any allergies"
      maxLength={500}
    />
  </>
);
