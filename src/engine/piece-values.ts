import type { PieceSymbol, Color } from 'chess.js';

export interface PieceValue {
  name: string;
  symbol: PieceSymbol;
  value: number;
  description: string;
}

// ─── Dynasties of Bharat — Indic piece names ───
export const PIECE_VALUES: Record<PieceSymbol, PieceValue> = {
  k: { name: 'Maharaja',       symbol: 'k', value: 0,    description: 'Priceless — the throne itself' },
  q: { name: 'Rajmata',        symbol: 'q', value: 3000, description: '3,000 TR' },
  r: { name: 'Durg',           symbol: 'r', value: 1500, description: '1,500 TR (Fortress)' },
  b: { name: 'Acharya',        symbol: 'b', value: 1000, description: '1,000 TR (Sage)' },
  n: { name: 'Ashva',          symbol: 'n', value: 1000, description: '1,000 TR (Warhorse)' },
  p: { name: 'Padati',         symbol: 'p', value: 500,  description: '500 TR (Infantry)' },
};

export const STARTING_CAPITAL = 10000;

export const INVESTMENT_PRESETS = [100, 250, 500, 1000] as const;

export type InvestmentPreset = (typeof INVESTMENT_PRESETS)[number];

export function getPieceValue(piece: PieceSymbol): number {
  return PIECE_VALUES[piece].value;
}

export function getPieceName(piece: PieceSymbol): string {
  return PIECE_VALUES[piece].name;
}

export function getTotalMaterialValue(pieces: PieceSymbol[]): number {
  return pieces.reduce((sum, p) => sum + getPieceValue(p), 0);
}

// Currency: Treasury Reserves (TR) — en-IN locale for Indian numbering
export function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${prefix}${abs.toLocaleString('en-IN')} TR`;
}

export function formatCurrencyChange(amount: number): string {
  if (amount === 0) return '0 TR';
  const prefix = amount > 0 ? '+' : '-';
  return `${prefix}${Math.abs(amount).toLocaleString('en-IN')} TR`;
}
