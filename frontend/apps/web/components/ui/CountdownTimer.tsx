"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

type CountdownTimerProps = {
  seconds?: number;
  label?: string;
  warnAtSeconds?: number;
  dangerAtSeconds?: number;
  showIcon?: boolean;
};

const DEFAULT_WARN_SECONDS = 15 * 60;
const DEFAULT_DANGER_SECONDS = 5 * 60;

const formatDuration = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function CountdownTimer({
  seconds = 60,
  label,
  warnAtSeconds = DEFAULT_WARN_SECONDS,
  dangerAtSeconds = DEFAULT_DANGER_SECONDS,
  showIcon = true,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor(seconds)),
  );

  useEffect(() => {
    const next = Math.max(0, Math.floor(seconds));
    setRemaining(next);

    if (next <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const formatted = useMemo(() => formatDuration(remaining), [remaining]);
  const tone =
    remaining <= dangerAtSeconds
      ? "error.main"
      : remaining <= warnAtSeconds
        ? "warning.main"
        : "text.secondary";

  return (
    <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ color: tone }}>
      {showIcon && <AccessTimeIcon sx={{ fontSize: 14 }} />}
      {label && (
        <>
          <Typography
            component="span"
            variant="caption"
            sx={{ color: tone, fontWeight: 500 }}
          >
            {label}
          </Typography>
          <Typography component="span" variant="caption" sx={{ color: tone, mx: 0.5 }}>
            -
          </Typography>
        </>
      )}
      <Typography
        component="span"
        variant="caption"
        sx={{
          color: tone,
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: 700,
          letterSpacing: 0.3,
        }}
      >
        {formatted}
      </Typography>
    </Box>
  );
}
