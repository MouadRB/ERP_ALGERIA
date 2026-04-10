'use client';

import type { Order } from '@ferza/shared';
import { getWilayaByCode } from '@ferza/shared';

const escapeCSV = (value: unknown) => {
  const str = String(value ?? '');
  if (/[\";\n\r]/.test(str)) {
    return `"${str.replace(/\"/g, '""')}"`;
  }
  return str;
};

export const exportOrderToCSV = (order: Order) => {
  const wilayaName = order.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.wilayaCode
    : '';
  const wilayaLabel = order.wilayaCode ? `${wilayaName} (${order.wilayaCode})` : wilayaName;

  const headers = [
    'Reference',
    'Statut',
    'Client',
    'Telephone',
    'Wilaya',
    'Adresse',
    'Commune',
    'Source',
    'Carrier',
    'Tracking',
    'Montant COD',
    'Date creation',
  ];

  const row = [
    order.reference ?? '',
    order.status ?? '',
    order.customerNameFr ?? '',
    order.customerPhone ?? '',
    wilayaLabel,
    order.address ?? '',
    order.commune ?? '',
    order.source ?? '',
    order.carrier ?? '',
    order.trackingNumber ?? '',
    order.codAmount ?? '',
    order.createdAt ? new Date(order.createdAt).toISOString() : '',
  ];

  const csv = [headers, row].map((r) => r.map(escapeCSV).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `commande-${order.reference ?? 'export'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
