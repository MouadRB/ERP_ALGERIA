"use client";

import { Typography } from "@mui/material";

type BilingualTextProps = {
  fr: string;
  ar: string;
  locale?: "fr" | "ar";
};

export default function BilingualText({ fr, ar, locale = "fr" }: BilingualTextProps) {
  const text = locale === "ar" ? ar : fr;
  return <Typography>{text}</Typography>;
}
