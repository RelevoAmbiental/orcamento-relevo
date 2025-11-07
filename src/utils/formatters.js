// src/utils/formatters.js - COMPLETO
// Funções de formatação para o padrão brasileiro
export const formatarValorBR = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

export const formatarPercentual = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '0,00%';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor * 100) + '%';
};