'use client';

import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import PhoneIcon        from '@mui/icons-material/Phone';
import WhatsAppIcon     from '@mui/icons-material/WhatsApp';
import EmailIcon        from '@mui/icons-material/Email';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Customer } from '@ferza/shared';

interface Props { customer: Customer; onOpenTicket?: () => void; }

export default function ActionsRapidesCard({ customer, onOpenTicket }: Props) {
  const phone213 = `213${customer.phone.slice(1)}`;
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          Actions Rapides
        </Typography>
        <Grid container spacing={1} mt={0.5}>
          <Grid item xs={6}>
            <Button fullWidth variant="contained" size="small" startIcon={<PhoneIcon />}
              component="a" href={`tel:+${phone213}`}>
              Appeler
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" size="small" startIcon={<WhatsAppIcon />}
              component="a" href={`https://wa.me/${phone213}`} target="_blank">
              WhatsApp
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" size="small" startIcon={<EmailIcon />}
              component="a" href={`mailto:${customer.email ?? ''}`} disabled={!customer.email}>
              Email
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" size="small" startIcon={<ShoppingCartIcon />} onClick={onOpenTicket}>
              Ticket
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
