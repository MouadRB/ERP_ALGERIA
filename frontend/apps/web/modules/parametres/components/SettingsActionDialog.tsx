"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";

type DialogField = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "select";
  options?: Array<{ label: string; value: string }>;
};

type SettingsActionDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  fields: DialogField[];
  values: Record<string, string | number>;
  submitLabel?: string;
  onClose: () => void;
  onChange: (key: string, value: string | number) => void;
  onSubmit: () => void;
};

export default function SettingsActionDialog({
  open,
  title,
  description,
  fields,
  values,
  submitLabel = "Enregistrer",
  onClose,
  onChange,
  onSubmit
}: SettingsActionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
          {fields.map((field) => {
            const type = field.type ?? "text";
            return (
              <TextField
                key={field.key}
                label={field.label}
                value={values[field.key] ?? ""}
                type={type === "number" ? "number" : type === "email" ? "email" : "text"}
                select={type === "select"}
                multiline={type === "textarea"}
                minRows={type === "textarea" ? 4 : undefined}
                onChange={(event) =>
                  onChange(
                    field.key,
                    type === "number" ? Number(event.target.value) || 0 : event.target.value
                  )
                }
              >
                {type === "select"
                  ? field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))
                  : null}
              </TextField>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
