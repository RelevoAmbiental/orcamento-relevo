// src/utils/validators.js
// Validações simples e compatíveis com o OrcamentoContext.jsx atual

export const validators = {
  // Verifica se o valor é numérico
  number: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') return null;
    return isNaN(Number(value)) ? `${fieldName} deve ser numérico` : null;
  },

  // Verifica se está no intervalo 0..1 (para percentuais em formato decimal)
  range01: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') return null;
    const v = Number(value);
    if (isNaN(v)) return `${fieldName} deve ser numérico`;
    if (v < 0 || v > 1) return `${fieldName} deve estar entre 0 e 1 (ex: 0.15 para 15%)`;
    return null;
  },

  // Validações específicas para parâmetros do orçamento
  parametros: {
    imposto:           (v) => validators.range01(v, 'Imposto'),
    lucro:             (v) => validators.range01(v, 'Lucro'),
    fundoGiro:         (v) => validators.range01(v, 'Fundo de Giro'),
    encargosPessoal:   (v) => validators.range01(v, 'Encargos Pessoal'),
    despesasFiscais:   (v) => validators.range01(v, 'Despesas Fiscais'),
    comissaoCaptacao:  (v) => validators.range01(v, 'Comissão de Captação'),
  },

  // Validação genérica de campos obrigatórios
  required: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },

  // Valida item de tabela (coordenacao, profissionais, etc.)
  item: (item) => {
    if (!item) return ['Item inválido'];
    const errors = [];
    if (item.valor !== undefined && isNaN(Number(item.valor))) {
      errors.push('Valor deve ser numérico');
    }
    if (item.qtd !== undefined && isNaN(Number(item.qtd))) {
      errors.push('Quantidade deve ser numérica');
    }
    if (item.dias !== undefined && isNaN(Number(item.dias))) {
      errors.push('Dias deve ser numérico');
    }
    return errors.length ? errors : null;
  },
};

export default validators;
