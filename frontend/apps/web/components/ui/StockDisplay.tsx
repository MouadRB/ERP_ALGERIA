"use client";

import { Typography } from "@mui/material";

type StockDisplayProps = {
  quantity: number;
};

export default function StockDisplay({ quantity }: StockDisplayProps) {
  const color = quantity <= 5 ? "error.main" : "success.main";
  return (
    <Typography variant="body2" sx={{ color }}>
      {quantity} units
    </Typography>
  );
}
