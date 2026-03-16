"use client";

import { Typography } from "@mui/material";

type PhoneDisplayProps = {
  phone: string;
};

export default function PhoneDisplay({ phone }: PhoneDisplayProps) {
  return <Typography variant="body2">{phone}</Typography>;
}
