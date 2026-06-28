import type { SxProps, Theme } from '@mui/material/styles';

// MUI's default outlined inputs render dark text/labels/borders meant for a
// light fill, which is invisible on the scorebook feature's dark background.
// These overrides make the inputs legible without breaking the dark theme.
// Shared by NewRoundForm and RoundSetup so the two forms stay consistent.
export const darkFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-input': { color: 'rgba(255, 255, 255, 0.92)' },
  '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)', opacity: 1 },
  '& .MuiOutlinedInput-input.Mui-disabled': { WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)' },
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-brand-500)' },
  '& .MuiInputLabel-root.Mui-disabled': { color: 'rgba(255, 255, 255, 0.4)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-brand-500)'
  },
  '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.12)'
  }
};
