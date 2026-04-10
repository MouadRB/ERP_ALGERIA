"use client";

import type { ChipProps } from "@mui/material";
import { Chip } from "@mui/material";
import type { RiskLevel } from "@ferza/shared";
import { useTranslations } from "next-intl";

const RISK_COLORS: Record<RiskLevel, ChipProps["color"]> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "error",
};

type RiskBadgeProps = {
  level: RiskLevel;
  size?: ChipProps["size"];
};

export default function RiskBadge({ level, size = "small" }: RiskBadgeProps) {
  const t = useTranslations();
  const label = t(`riskLevels.${level}`);

  return (
    <Chip
      label={label}
      color={RISK_COLORS[level]}
      size={size}
      variant={level === "LOW" ? "outlined" : "filled"}
      sx={{
        fontSize: 11,
        height: 22,
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}
