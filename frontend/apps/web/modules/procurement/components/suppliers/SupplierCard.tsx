import { Avatar, Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import BusinessRounded from "@mui/icons-material/BusinessRounded";

type Supplier = {
  id: string;
  name: string;
  wilayaCode: string;
  phone: string;
  email: string | null;
  totalBCs: number;
};

type SupplierCardProps = {
  supplier: Supplier;
  onCreateBC?: (supplier: Supplier) => void;
};

export default function SupplierCard({ supplier, onCreateBC }: SupplierCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0", height: "100%" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#E0F2FE", color: "#0369A1" }}>
            <BusinessRounded fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {supplier.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {supplier.id}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`${supplier.totalBCs} BCs`}
            sx={{ backgroundColor: "#DBEAFE", color: "#1D4ED8" }}
          />
          <Chip
            size="small"
            label={`Wilaya ${supplier.wilayaCode}`}
            sx={{ backgroundColor: "#F1F5F9", color: "#475569" }}
          />
        </Stack>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Téléphone: {supplier.phone}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {supplier.email ?? "Non renseigné"}
          </Typography>
        </Box>

        <Box sx={{ marginTop: "auto" }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onCreateBC?.(supplier)}
          >
            Créer un BC
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
