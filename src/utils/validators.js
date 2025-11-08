// src/utils/validators.js
// Validações simples e coerentes com a UI (percentuais em DECIMAL 0..1)

export const validators = {
  // numérico opcional
  number: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') return null;
    return isNaN(Number(value)) ? `${fieldName} deve ser numérico` : null;
  },

  // 0..1 (ex.: 0.15 = 15%)
  range01: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') return null;
    const v = Number(value);
    if (isNaN(v)) return `${fieldName} deve ser numérico`;
    if (v < 0 || v > 1) return `${fieldName} deve estar entre 0 e 1`;
    return null;
  },

  // Validações específicas
  parametros: {
    imposto:           (v) => validators.range01(v, 'Imposto'),
    lucro:             (v) => validators.range01(v, 'Lucro'),
    fundoGiro:         (v) => validators.range01(v, 'Fundo de Giro'),
    encargosPessoal:   (v) => validators.range01(v, 'Encargos Pessoal'),
    despesasFiscais:   (v) => validators.range01(v, 'Despesas Fiscais'),
    comissaoCaptacao:  (v) => validators.range01(v, 'Comissão de Captação'),
  },
};

export default validators;
