'use client';

import * as React from 'react';
import {
  Avatar, Box, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Menu, MenuItem, TableCell,
  TableRow, TextField, Tooltip, Typography, Button,
} from '@mui/material';
import WhatsAppIcon   from '@mui/icons-material/WhatsApp';
import NoteAddIcon    from '@mui/icons-material/NoteAdd';
import MoreVertIcon   from '@mui/icons-material/MoreVert';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import type { Ticket } from '@ferza/shared';
import { WILAYAS }    from '@ferza/shared';
import { useUpdateTicket } from '@/modules/crm/hooks/useUpdateTicket';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'warning' | 'error' | 'success' | 'secondary'> = {
  'Ouvert':            'error',
  'En cours':          'primary',
  'En attente client': 'warning',
  'Escaladé':          'error',
  'Résolu':            'success',
  'Fermé':             'default',
};

const PRIORITY_COLOR: Record<string, 'default' | 'primary' | 'warning' | 'error'> = {
  'Faible':   'default',
  'Normale':  'primary',
  'Haute':    'warning',
  'Critique': 'error',
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7)  return `${days}j`;
  return `${Math.floor(days / 7)} sem.`;
}

interface Props { ticket: Ticket; }

const MOCK_AGENTS = [
  { id: 'AGT-001', name: 'Karim B.' },
  { id: 'AGT-002', name: 'Amina R.' },
  { id: 'AGT-003', name: 'Youcef M.' },
  { id: 'AGT-004', name: 'Salima D.' },
];

export default function TicketRow({ ticket }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [assignAnchor, setAssignAnchor] = React.useState<null | HTMLElement>(null);
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [noteContent, setNoteContent] = React.useState('');
  const updateTicket = useUpdateTicket();
  const wilaya = WILAYAS.find((w) => w.code === ticket.customerWilayaCode);

  const handleAction = (action: string) => {
    setAnchorEl(null);
    if (action === 'close')   updateTicket.mutate({ id: ticket.id, customerId: ticket.customerId, status: 'Fermé' });
    if (action === 'resolve') updateTicket.mutate({ id: ticket.id, customerId: ticket.customerId, status: 'Résolu' });
    if (action === 'escalate')updateTicket.mutate({ id: ticket.id, customerId: ticket.customerId, escalated: true, status: 'Escaladé', lastAction: 'Escaladé manuellement' });
  };

  const handleAssign = (agent: { id: string; name: string }) => {
    setAssignAnchor(null);
    updateTicket.mutate({
      id: ticket.id,
      customerId: ticket.customerId,
      agentId: agent.id,
      agentName: agent.name,
      status: ticket.status === 'Ouvert' ? 'En cours' : undefined,
      lastAction: `Assigné à ${agent.name}`,
    });
  };

  const handleNoteSubmit = () => {
    if (!noteContent.trim()) return;
    updateTicket.mutate({
      id: ticket.id,
      customerId: ticket.customerId,
      note: { content: noteContent.trim(), author: 'Agent CRM' },
      lastAction: 'Note ajoutée',
    });
    setNoteContent('');
    setNoteOpen(false);
  };

  return (
    <TableRow hover sx={{ bgcolor: ticket.escalated ? '#FFF8E1' : undefined }}>
      {/* #TICKET */}
      <TableCell>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" fontFamily="monospace" color="primary.main" fontWeight={700}>
            {ticket.id}
          </Typography>
          {ticket.escalated && (
            <Chip label="ESCALADÉ" size="small" color="error" sx={{ fontSize: 9, height: 16 }} />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {relativeTime(ticket.createdAt)}
        </Typography>
      </TableCell>

      {/* CLIENT */}
      <TableCell>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 150 }}>
          {ticket.customerNameFr}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
          {ticket.customerPhone}
        </Typography>
        {wilaya && <Typography variant="caption" color="text.secondary" display="block">{wilaya.name}</Typography>}
      </TableCell>

      {/* TYPE */}
      <TableCell>
        <Chip label={ticket.category} size="small" variant="outlined" sx={{ fontSize: 10, maxWidth: 160 }} />
      </TableCell>

      {/* STATUT */}
      <TableCell>
        <Chip label={ticket.status} size="small" color={STATUS_COLOR[ticket.status] ?? 'default'} />
      </TableCell>

      {/* PRIORITÉ */}
      <TableCell>
        <Chip label={ticket.priority} size="small" color={PRIORITY_COLOR[ticket.priority] ?? 'default'} variant="outlined" />
      </TableCell>

      {/* COMMANDE LIÉE */}
      <TableCell>
        {ticket.orderId
          ? <Typography variant="caption" fontFamily="monospace" color="primary.main">{ticket.orderId}</Typography>
          : <Typography variant="caption" color="text.disabled">—</Typography>
        }
      </TableCell>

      {/* AGENT */}
      <TableCell>
        {ticket.agentName
          ? <Box display="flex" alignItems="center" gap={0.5}>
              <Avatar sx={{ width: 22, height: 22, fontSize: 11 }}>{ticket.agentName[0]}</Avatar>
              <Typography variant="caption">{ticket.agentName}</Typography>
            </Box>
          : <Typography variant="caption" color="text.disabled">Non assigné</Typography>
        }
      </TableCell>

      {/* DERNIÈRE ACTION */}
      <TableCell sx={{ maxWidth: 180 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ticket.lastAction ?? '—'}
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block">
          {relativeTime(ticket.updatedAt)}
        </Typography>
      </TableCell>

      {/* ACTIONS */}
      <TableCell>
        <Box display="flex" alignItems="center">
          <Tooltip title="WhatsApp">
            <IconButton size="small" component="a" href={`https://wa.me/213${ticket.customerPhone.slice(1)}`} target="_blank">
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Note">
            <IconButton size="small" onClick={() => setNoteOpen(true)}><NoteAddIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Assigner">
            <IconButton size="small" onClick={(e) => setAssignAnchor(e.currentTarget)}><AssignmentIndIcon fontSize="small" /></IconButton>
          </Tooltip>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleAction('resolve')}>Marquer résolu</MenuItem>
            <MenuItem onClick={() => handleAction('escalate')}>Escalader</MenuItem>
            <MenuItem onClick={() => handleAction('close')} sx={{ color: 'text.secondary' }}>Fermer</MenuItem>
          </Menu>

          {/* Assign agent menu */}
          <Menu anchorEl={assignAnchor} open={Boolean(assignAnchor)} onClose={() => setAssignAnchor(null)}>
            {MOCK_AGENTS.map((agent) => (
              <MenuItem key={agent.id} onClick={() => handleAssign(agent)} selected={ticket.agentId === agent.id}>
                {agent.name}
              </MenuItem>
            ))}
          </Menu>

          {/* Add note dialog */}
          <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Ajouter une note — {ticket.id}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={3}
                placeholder="Contenu de la note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNoteOpen(false)}>Annuler</Button>
              <Button variant="contained" onClick={handleNoteSubmit} disabled={!noteContent.trim()}>
                Enregistrer
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </TableCell>
    </TableRow>
  );
}
