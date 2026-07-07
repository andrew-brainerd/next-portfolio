'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { addItem } from '@/api/oishii';
import { brandContainedButtonSx, lightFieldSx } from '@/components/scorebook/fieldStyles';
import type { AddItemInput } from '@/types/oishii';

interface AddItemFormProps {
  pantryId: string;
  onAdded: () => void | Promise<void>;
}

export const AddItemForm = ({ pantryId, onAdded }: AddItemFormProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setQuantity('');
    setUnit('');
    setCategory('');
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const input: AddItemInput = { name: trimmedName };
    const parsedQuantity = Number(quantity);
    if (quantity.trim() && Number.isFinite(parsedQuantity)) input.quantity = parsedQuantity;
    if (unit.trim()) input.unit = unit.trim();
    if (category.trim()) input.category = category.trim();

    setSubmitting(true);
    setError(null);
    try {
      await addItem(pantryId, input);
      reset();
      await onAdded();
    } catch (err) {
      console.error(err);
      setError('Could not add item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl rounded-xl border border-brand-200 bg-white p-6 text-neutral-900 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Item name"
          value={name}
          onChange={e => setName(e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. Soy sauce"
          disabled={submitting}
          sx={lightFieldSx}
        />
        <TextField
          label="Quantity (optional)"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          type="number"
          size="small"
          fullWidth
          disabled={submitting}
          sx={lightFieldSx}
        />
        <TextField
          label="Unit (optional)"
          value={unit}
          onChange={e => setUnit(e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. bottles"
          disabled={submitting}
          sx={lightFieldSx}
        />
        <TextField
          label="Category (optional)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. Condiments"
          disabled={submitting}
          sx={lightFieldSx}
        />
      </div>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <div className="mt-4">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          sx={brandContainedButtonSx}
        >
          {submitting ? 'Adding...' : 'Add item'}
        </Button>
      </div>
    </div>
  );
};
