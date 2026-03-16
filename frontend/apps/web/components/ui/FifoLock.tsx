"use client";

import { Tooltip } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function FifoLock() {
  return (
    <Tooltip title="FIFO lock enabled">
      <LockOutlinedIcon fontSize="small" />
    </Tooltip>
  );
}
