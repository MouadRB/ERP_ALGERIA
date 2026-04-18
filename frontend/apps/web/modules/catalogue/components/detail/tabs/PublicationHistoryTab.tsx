'use client';

import {
  Box,
  Stack,
  Paper,
  Typography,
} from '@mui/material';
import ArrowCircleUpOutlinedIcon from '@mui/icons-material/ArrowCircleUpOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import type { CatalogueEntry, CatalogueHistoryItem } from '../../../catalogue.types';

type PublicationHistoryTabProps = {
  entry: CatalogueEntry;
};

const ICON_MAP = {
  alert: { bg: 'rgba(88,166,255,0.15)', color: 'primary.main', icon: ArrowCircleUpOutlinedIcon },
  draft: { bg: '#30363d', color: 'text.secondary', icon: DescriptionOutlinedIcon },
  mask: { bg: 'rgba(248,81,73,0.15)', color: 'error.main', icon: VisibilityOffOutlinedIcon },
  publish: { bg: 'rgba(46,160,67,0.15)', color: 'success.main', icon: CheckCircleOutlineOutlinedIcon },
  reindex: { bg: 'rgba(46,160,67,0.15)', color: 'success.main', icon: RestartAltOutlinedIcon },
  schedule: { bg: 'rgba(188,140,255,0.15)', color: '#bc8cff', icon: EventAvailableOutlinedIcon },
};

const NOTE_COLORS = {
  danger: '#f85149',
  info: '#58a6ff',
  neutral: '#8b949e',
  success: '#2ea043',
  warning: '#d29922',
};

function formatHistoryMeta(dateIso: string, actor: string) {
  const date = new Date(dateIso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    const label = diffDays <= 0 ? "Aujourd'hui" : `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return `${label} - Par: ${actor}`;
  }

  const time = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
  return `${date.toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} - ${time} - Par: ${actor}`;
}

function getNote(item: CatalogueHistoryItem) {
  if (item.note) {
    return {
      color: NOTE_COLORS[item.noteTone ?? 'success'],
      text: item.note,
    };
  }

  return null;
}

export default function PublicationHistoryTab({ entry }: PublicationHistoryTabProps) {
  const items = [...entry.history].sort(
    (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime(),
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        Historique de Publication
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mt: 1.5,
          px: 1.5,
          py: 1.1,
          borderRadius: 3,
          bgcolor: 'rgba(88,166,255,0.15)',
          color: 'primary.main',
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
        <Typography variant="body2" fontWeight={700}>
          Journal append-only - Conforme Loi 18-07 - Retention 10 ans - Aucune entree ne peut etre modifiee ou supprimee.
        </Typography>
      </Stack>

      <Stack spacing={2.5} sx={{ mt: 2.5 }}>
        {items.map((item) => {
          const config = ICON_MAP[item.type as keyof typeof ICON_MAP] ?? ICON_MAP.publish;
          const Icon = config.icon;
          const note = getNote(item);
          return (
            <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  bgcolor: config.bg,
                  color: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.25 }}>
                  {item.title}
                </Typography>
                {item.subtitle ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>
                    {item.subtitle}
                  </Typography>
                ) : null}
                {note ? (
                  <Typography variant="body2" sx={{ color: note.color, mt: 0.25, fontWeight: 700 }}>
                    {note.text}
                  </Typography>
                ) : null}
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.45 }}>
                  {formatHistoryMeta(item.at, item.actor)}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
