import React from 'react';
import { TipoNaturezaCodigo } from '../domain/cantinaDomain';

export function formatarMoeda(valor: number): string {
  if (!Number.isFinite(valor)) return 'R$ --';
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Busca sem diferenciar acentos e maiúsculas ("cafe" encontra "Café"). */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function descricaoPadrao(natureza: TipoNaturezaCodigo): string {
  return natureza === 'ESTUFA_RAPIDO'
    ? 'Pronto na estufa para retirada rápida no intervalo.'
    : 'Preparado na hora na chapa quente da cantina.';
}

/** Classes de borda de um campo de formulário, destacando quando há erro. */
export function classeBordaCampo(erro?: string): string {
  return erro
    ? 'border-red-400 bg-red-50/40 focus:border-red-500'
    : 'border-slate-200 bg-slate-50 focus:border-[#FF6B00] focus:bg-white';
}

export function MensagemCampo({ id, erro }: { id: string; erro?: string }) {
  if (!erro) return null;
  return (
    <p id={id} className="mt-1 text-[11px] font-semibold text-red-700">
      {erro}
    </p>
  );
}
