import { Grid } from "@mui/material";
import SupplierCard from "./SupplierCard";

type Supplier = {
  id: string;
  name: string;
  wilayaCode: string;
  phone: string;
  email: string | null;
  totalBCs: number;
};

type SupplierGridProps = {
  suppliers: Supplier[];
  onCreateBC?: (supplier: Supplier) => void;
};

export default function SupplierGrid({ suppliers, onCreateBC }: SupplierGridProps) {
  return (
    <Grid container spacing={2}>
      {suppliers.map((supplier) => (
        <Grid item xs={12} md={6} xl={4} key={supplier.id}>
          <SupplierCard supplier={supplier} onCreateBC={onCreateBC} />
        </Grid>
      ))}
    </Grid>
  );
}
