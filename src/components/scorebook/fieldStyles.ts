import type { SxProps, Theme } from '@mui/material/styles';

// The scorebook forms render on white cards (see NewRoundForm / RoundSetup), so
// MUI's default light-mode inputs are already legible — these overrides only tint
// the focus/hover states with the active theme's brand color. Shared so the two
// forms stay consistent.
export const lightFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': { backgroundColor: '#fff' },
  '& .MuiOutlinedInput-input': { color: 'rgba(0, 0, 0, 0.87)' },
  '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(0, 0, 0, 0.45)', opacity: 1 },
  '& .MuiOutlinedInput-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.5)' },
  '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-brand-700)' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-brand-400)'
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-brand-600)'
  }
};

// Outlined/text secondary buttons themed to the active brand color.
export const brandButtonSx: SxProps<Theme> = {
  color: 'var(--color-brand-700)',
  borderColor: 'var(--color-brand-300)',
  '&:hover': {
    borderColor: 'var(--color-brand-500)',
    backgroundColor: 'var(--color-brand-100)'
  }
};

// Filled primary action button (Create / Start) themed to the active brand color.
export const brandContainedButtonSx: SxProps<Theme> = {
  backgroundColor: 'var(--color-brand-600)',
  '&:hover': { backgroundColor: 'var(--color-brand-700)' }
};
