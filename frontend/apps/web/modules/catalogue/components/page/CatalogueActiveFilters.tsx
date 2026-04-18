import { Chip, Stack } from '@mui/material';

interface CatalogueActiveFiltersProps {
  filters: Array<[string, string | number]>;
  onRemove: (key: string) => void;
}

export default function CatalogueActiveFilters({
  filters,
  onRemove,
}: CatalogueActiveFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      {filters.map(([key, value]) => (
        <Chip key={key} label={`${key}: ${value}`} onDelete={() => onRemove(key)} />
      ))}
    </Stack>
  );
}
