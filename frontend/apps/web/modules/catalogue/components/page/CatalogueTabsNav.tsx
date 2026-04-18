import { Paper, Tab, Tabs } from '@mui/material';

const TABS = ['Produits', 'Categories', 'Canaux de Vente', 'Analytique'];

interface CatalogueTabsNavProps {
  activeTab: number;
  onChange: (value: number) => void;
}

export default function CatalogueTabsNav({ activeTab, onChange }: CatalogueTabsNavProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 0.75, mb: 2, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ '& .MuiTabs-indicator': { display: 'none' } }}
      >
        {TABS.map((tab, index) => (
          <Tab
            key={tab}
            label={tab}
            value={index}
            sx={{
              minHeight: 40,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: '#fff',
              },
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
