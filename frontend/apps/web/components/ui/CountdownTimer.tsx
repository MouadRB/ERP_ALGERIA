"use client";

import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

type CountdownTimerProps = {
  seconds?: number;
};

export default function CountdownTimer({ seconds = 60 }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <Typography variant="body2">{remaining}s</Typography>;
}
