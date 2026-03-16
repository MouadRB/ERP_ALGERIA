"use client";

import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type SearchInputProps = {
  placeholder?: string;
};

export default function SearchInput({ placeholder = "Search" }: SearchInputProps) {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        )
      }}
    />
  );
}
