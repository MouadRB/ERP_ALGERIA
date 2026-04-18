'use client';

import {
  Box,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useRiskProfile } from '@/modules/crm/hooks/useRiskProfile';
import type { RiskLevel, RiskFactor } from '@ferza/shared';

const LEVEL_COLOR: Record<RiskLevel, string> = {
  LOW:      '#2ea043',
  MEDIUM:   '#d29922',
  HIGH:     '#f85149',
  CRITICAL: '#7B1FA2',
};

const LEVEL_LABEL: Record<RiskLevel, string> = {
  LOW:      'Faible',
  MEDIUM:   'Modéré',
  HIGH:     'Élevé',
  CRITICAL: 'Critique',
};

const LEVEL_BAR_COLOR: Record<RiskLevel, 'success' | 'warning' | 'error' | 'secondary'> = {
  LOW:      'success',
  MEDIUM:   'warning',
  HIGH:     'error',
  CRITICAL: 'secondary',
};

function ScoreGauge({ score, level }: { score: number; level: RiskLevel }) {
  const color = LEVEL_COLOR[level];
  return (
    <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 1 }}>
      {/* Simple circular-ish display via border */}
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: `8px solid ${color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}18`,
        }}
      >
        <Typography variant="h4" fontWeight={800} color={color} lineHeight={1}>
          {score}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / 100
        </Typography>
      </Box>
    </Box>
  );
}

function TendencyIcon({ tendency }: { tendency: 'improving' | 'stable' | 'worsening' }) {
  if (tendency === 'improving') return <TrendingDownIcon color="success" fontSize="small" />;
  if (tendency === 'worsening') return <TrendingUpIcon color="error" fontSize="small" />;
  return <TrendingFlatIcon color="disabled" fontSize="small" />;
}

function FactorCard({ factor }: { factor: RiskFactor }) {
  const barColor = LEVEL_BAR_COLOR[factor.level];
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="caption" fontWeight={700}>{factor.name}</Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip
            label={LEVEL_LABEL[factor.level]}
            size="small"
            sx={{
              fontSize: 9,
              height: 18,
              bgcolor: `${LEVEL_COLOR[factor.level]}22`,
              color: LEVEL_COLOR[factor.level],
              fontWeight: 700,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            ×{factor.weight}%
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={factor.value}
        color={barColor}
        sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
      />
      <Typography variant="caption" color="text.secondary">{factor.description}</Typography>
    </Paper>
  );
}

interface Props { customerId: string; }

export default function RisqueFraudeTab({ customerId }: Props) {
  const { data, isLoading } = useRiskProfile(customerId);
  const profile = data?.data;

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (!profile) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Profil de risque indisponible</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Score Header */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, textAlign: 'center' }}>
        <ScoreGauge score={profile.score} level={profile.level} />
        <Typography variant="h6" fontWeight={700} color={LEVEL_COLOR[profile.level]}>
          Risque {LEVEL_LABEL[profile.level]}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={0.5}>
          <TendencyIcon tendency={profile.tendency} />
          <Typography variant="caption" color="text.secondary">
            {profile.tendency === 'improving' ? 'En amélioration'
              : profile.tendency === 'worsening' ? 'En dégradation'
              : 'Stable'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {profile.description}
        </Typography>
      </Paper>

      {/* Factor Cards */}
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Facteurs de risque
      </Typography>
      <Stack spacing={1} mb={2}>
        {profile.factors.map((factor) => (
          <FactorCard key={factor.name} factor={factor} />
        ))}
      </Stack>

      {/* Recommendations */}
      {profile.recommendations.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Recommandations
          </Typography>
          <List dense disablePadding>
            {profile.recommendations.map((rec, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.3 }}>
                <ListItemText
                  primary={rec}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Typography variant="caption" color="text.disabled" display="block" mt={2} textAlign="right">
        Calculé le {new Date(profile.computedAt).toLocaleDateString('fr-DZ', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </Typography>
    </Box>
  );
}
