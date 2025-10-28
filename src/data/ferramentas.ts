export interface Ferramenta {
  value: string;
  label: string;
}

export const FERRAMENTAS_DISPONIVEIS: Ferramenta[] = [
  { value: 'stf', label: 'Superior Tribunal Federal' },
  { value: 'tcu', label: 'Tribunal de Contas da União' },
  { value: 'tcepe', label: 'Tribunal de Contas do Estado de Pernambuco' },
  { value: 'busca-internet', label: 'Busca na Internet' }
];