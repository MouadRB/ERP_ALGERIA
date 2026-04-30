"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from "@mui/material";
import {
  AddRounded,
  CloseRounded,
  SearchOutlined,
  ShieldOutlined
} from "@mui/icons-material";
import { formatDZD, type BCItem, type BonCommande } from "@ferza/shared";

type NewBCWizardProps = {
  open: boolean;
  onClose: () => void;
  suppliers?: string[];
  initialSupplier?: string;
  onSubmit?: (payload: NewBCPayload) => Promise<boolean | void> | boolean | void;
  submitting?: boolean;
};

type PriorityOption = {
  value: "urgent" | "high" | "normal" | "low";
  label: string;
  helper: string;
  color: string;
  border: string;
};

const priorityOptions: PriorityOption[] = [
  {
    value: "urgent",
    label: "Urgente",
    helper: "Rupture totale ou commande urgente · Approbation prioritaire",
    color: "#EF4444",
    border: "#FCA5A5"
  },
  {
    value: "high",
    label: "Haute",
    helper: "Stock critique · Sous seuil depuis > 3 jours",
    color: "#F59E0B",
    border: "#FCD34D"
  },
  {
    value: "normal",
    label: "Normale",
    helper: "Réapprovisionnement standard · Stock sous seuil",
    color: "#2563EB",
    border: "#93C5FD"
  },
  {
    value: "low",
    label: "Basse",
    helper: "Anticipation · Stock encore suffisant",
    color: "#94A3B8",
    border: "#E2E8F0"
  }
];

type ItemRow = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
};

const mockProducts = [
  { id: "prd-1", name: "Apple AirPods Pro 2ème Génération", sku: "APP-PRO2-0501", unitPrice: 18000 },
  { id: "prd-2", name: "Tablette Huawei MediaPad T10", sku: "HUA-T10-0201", unitPrice: 26000 },
  { id: "prd-3", name: "Téléphone Samsung Galaxy A54", sku: "SAM-A54-0901", unitPrice: 38000 },
  { id: "prd-4", name: "Aspirateur Rowenta Silence Force", sku: "ROW-SIL-0105", unitPrice: 22000 },
  { id: "prd-5", name: "Robe Caftan Brodée", sku: "CAF-EMB-2002", unitPrice: 5500 }
];

type NewBCPayload = Partial<BonCommande>;

export default function NewBCWizard({
  open,
  onClose,
  suppliers = [],
  initialSupplier,
  onSubmit,
  submitting = false
}: NewBCWizardProps) {
  const supplierOptions = suppliers.length
    ? suppliers
    : ["Nike MENA", "Apple Distribution", "Adidas MENA", "Samsung Electronics"];
  const [activeStep, setActiveStep] = useState(0);
  const [supplier, setSupplier] = useState(supplierOptions[0]);
  const [priority, setPriority] = useState<PriorityOption["value"]>("normal");
  const [warehouse, setWarehouse] = useState("Alger WH-01 (Principal)");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    {
      id: "item-1",
      name: "Apple AirPods Pro 2ème Génération",
      sku: "APP-PRO2-0501",
      quantity: 50,
      unitPrice: 18000
    }
  ]);

  const steps = ["Informations", "Articles", "Récapitulatif"];

  useEffect(() => {
    if (open && initialSupplier) {
      setSupplier(initialSupplier);
    }
  }, [initialSupplier, open]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

  const handleClose = () => {
    setActiveStep(0);
    setSubmitError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!onSubmit) {
      handleClose();
      return;
    }
    const mappedItems: BCItem[] = items.map((item, index) => ({
      productId: item.id ?? `PRD-${index + 1}`,
      sku: item.sku,
      nameFr: item.name,
      nameAr: "",
      quantityOrdered: item.quantity,
      quantityReceived: 0,
      unitPriceHT: item.unitPrice,
      tvaRate: "standard"
    }));

    const payload: NewBCPayload = {
      supplierName: supplier,
      items: mappedItems,
      wilayaCode: "16",
      // @ts-expect-error extended fields forwarded to BFF for engine-b mapping
      priority,
      warehouse,
      notes: notes.trim() || undefined,
    };

    const result = await onSubmit(payload);
    if (result === false) {
      setSubmitError("Impossible de soumettre le BC. Vérifiez le BFF ou les champs.");
      return;
    }
    handleClose();
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${prev.length + 1}`,
        name: "Produit",
        sku: `SKU-${prev.length + 1}`,
        quantity: 10,
        unitPrice: 12000
      }
    ]);
  };

  const addProduct = (product: { id: string; name: string; sku: string; unitPrice: number }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          quantity: 1,
          unitPrice: product.unitPrice
        }
      ];
    });
  };

  const updateItem = (id: string, field: "quantity" | "unitPrice", value: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const canSubmit = supplier && items.length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AddRounded fontSize="small" />
          <Typography variant="h6">Nouveau Bon de Commande</Typography>
        </Stack>
        <IconButton onClick={handleClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: "#F8FAFC" }}>
        <Alert
          severity="warning"
          icon={<ShieldOutlined />}
          sx={{ marginBottom: 2, borderRadius: 2, alignItems: "center" }}
        >
          SoD RAPPEL: Le créateur de ce BC ne pourra pas l&apos;approuver. Un SuperAdmin
          ou Finance Director devra approuver avant envoi au fournisseur.
        </Alert>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ marginBottom: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 ? (
          <Stack spacing={2}>
            <TextField
              select
              label="Fournisseur"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
              required
            >
              {supplierOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {supplier}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      M. Karim Hassan · UAE
                    </Typography>
                  </Box>
                  <Chip label="Excellent · 94%" size="small" color="success" />
                </Stack>
                <Stack direction="row" spacing={3} sx={{ marginTop: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Délai: 7j
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    BCs actifs: 24
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Litiges: 0
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={1}>
              <Typography variant="subtitle2">Priorité</Typography>
              <GridPriority options={priorityOptions} value={priority} onChange={setPriority} />
            </Stack>

            <TextField
              select
              label="Entrepôt destination"
              value={warehouse}
              onChange={(event) => setWarehouse(event.target.value)}
              required
            >
              <MenuItem value="Alger WH-01 (Principal)">Alger WH-01 (Principal)</MenuItem>
              <MenuItem value="Oran WH-02 (Secondaire)">Oran WH-02 (Secondaire)</MenuItem>
              <MenuItem value="Constantine WH-03">Constantine WH-03</MenuItem>
            </TextField>

            <TextField
              label="Notes générales"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              multiline
              minRows={3}
              placeholder="Instructions spéciales, notes pour l'approbateur..."
            />
          </Stack>
        ) : null}

        {activeStep === 1 ? (
          <Stack spacing={2}>
            <TextField
              placeholder="Rechercher par nom, SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ marginRight: 1, color: "text.secondary" }}>
                    <SearchOutlined fontSize="small" />
                  </Box>
                )
              }}
            />

            <Stack spacing={1}>
              {mockProducts
                .filter((product) => {
                  const query = search.toLowerCase().trim();
                  if (!query) return true;
                  return (
                    product.name.toLowerCase().includes(query) ||
                    product.sku.toLowerCase().includes(query)
                  );
                })
                .slice(0, 4)
                .map((product) => (
                  <Card key={product.id} variant="outlined">
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {product.sku}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDZD(product.unitPrice)}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addProduct(product)}
                      >
                        Ajouter
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </Stack>

            <Stack spacing={2}>
              {items.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {item.sku}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="Quantité"
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(item.id, "quantity", Number(event.target.value))
                          }
                          sx={{ width: 110 }}
                        />
                        <TextField
                          label="Prix unitaire"
                          type="number"
                          size="small"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updateItem(item.id, "unitPrice", Number(event.target.value))
                          }
                          sx={{ width: 140 }}
                        />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {formatDZD(item.quantity * item.unitPrice)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ marginTop: 1, padding: "6px 10px", backgroundColor: "#EFF6FF", borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Couche FIFO prévue: #4 · Consommée après couches #1, #2, #3
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Button
              variant="outlined"
              startIcon={<AddRounded />}
              onClick={handleAddItem}
              sx={{ borderStyle: "dashed" }}
            >
              Ajouter article
            </Button>

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Sous-total
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatDZD(total)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Transport
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inclus (CIF)
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Droits douane
                </Typography>
                <Typography variant="body2" color="warning.main">
                  À confirmer
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>
                  Total BC
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {formatDZD(total)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        ) : null}

        {activeStep === 2 ? (
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ marginBottom: 1 }}>
                  Récapitulatif du Bon de Commande
                </Typography>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Fournisseur
                    </Typography>
                    <Typography variant="subtitle2">{supplier}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Articles
                    </Typography>
                    <Typography variant="subtitle2">{items.length} (50 unités)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Entrepôt
                    </Typography>
                    <Typography variant="subtitle2">{warehouse}</Typography>
                  </Stack>
                  <Stack spacing={0.5} alignItems="flex-end">
                    <Typography variant="caption" color="text.secondary">
                      Priorité
                    </Typography>
                    <Chip
                      label={priorityOptions.find((option) => option.value === priority)?.label}
                      size="small"
                      sx={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Montant
                    </Typography>
                    <Typography variant="subtitle2">{formatDZD(total)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ETA estimé
                    </Typography>
                    <Typography variant="subtitle2">7 jours</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Alert severity="info" icon={<ShieldOutlined />} sx={{ borderRadius: 2 }}>
              Ce BC sera soumis pour approbation SoD. Approbateur requis: SuperAdmin ou Finance Director.
              Vous: Procurement Manager – créateur uniquement.
            </Alert>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ marginBottom: 1 }}>
                  Actions automatiques après soumission
                </Typography>
                <Stack spacing={0.5}>
                  {[
                    "Stock: Soft reserve (si applicable)",
                    "Notification: SuperAdmin + Finance Dir.",
                    "Statut: En attente approbation",
                    "Journal: entrée immuable créée"
                  ].map((item) => (
                    <Typography key={item} variant="caption" color="text.secondary">
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ padding: 2, justifyContent: "space-between" }}>
        {submitError ? (
          <Typography variant="caption" color="error" sx={{ flex: 1 }}>
            {submitError}
          </Typography>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <Button onClick={handleClose}>Retour</Button>
        <Stack direction="row" spacing={1}>
          {activeStep > 0 ? (
            <Button variant="outlined" onClick={() => setActiveStep((prev) => prev - 1)}>
              Précédent
            </Button>
          ) : null}
          {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            disabled={submitting}
          >
            Suivant
          </Button>
        ) : (
            <Button
              variant="contained"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              Soumettre pour approbation
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

type GridPriorityProps = {
  options: PriorityOption[];
  value: PriorityOption["value"];
  onChange: (value: PriorityOption["value"]) => void;
};

function GridPriority({ options, value, onChange }: GridPriorityProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Card
            key={option.value}
            variant="outlined"
            onClick={() => onChange(option.value)}
            sx={{
              flex: "1 1 220px",
              cursor: "pointer",
              borderColor: active ? option.border : "#E2E8F0",
              boxShadow: active ? "0 0 0 1px rgba(59,130,246,0.4)" : "none"
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={<Radio checked={active} />}
                  label={null}
                  sx={{ marginRight: 0 }}
                />
                <Stack>
                  <Typography variant="subtitle2" fontWeight={700} color={option.color}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.helper}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
