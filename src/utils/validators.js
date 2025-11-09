// src/utils/validators.js
// -----------------------------------------------------
// Validações centralizadas para orçamentos Relevo
// Compatível com o OrcamentoContext restaurado
// -----------------------------------------------------

// Função auxiliar
const isNumber = (v) => typeof v === 'number' && !isNaN(v);
const isPositive = (v) => isNumber(v) && v >= 0;
const inRange = (v, min, max) => isNumber(v) && v >= min && v <= max;

// -----------------------------------------------------
// VALIDADORES INDIVIDUAIS POR SEÇÃO
// -----------------------------------------------------

export const validarMetadata = (metadata = {}) => {
  const errors = [];
  if (!metadata.nome || metadata.nome.trim() === '') {
    errors.push('O nome do orçamento é obrigatório.');
  }
  if (!metadata.cliente || metadata.cliente.trim() === '') {
    errors.push('O nome do cliente é obrigatório.');
  }
  if (!metadata.data) {
    errors.push('A data deve ser informada.');
  }
  if (!isNumber(metadata.desconto) && !isNumber(metadata.descontoPercentual)) {
    errors.push('O desconto deve ser numérico.');
  }
  return errors;
};

export const validarParametros = (parametros = {}) => {
  const errors = [];
  const chaves = [
    'imposto',
    'lucro',
    'fundoGiro',
    'encargosPessoal',
    'despesasFiscais',
    'comissaoCaptacao',
  ];
  chaves.forEach((key) => {
    const valor = Number(parametros[key] || 0);
    if (!inRange(valor, 0, 1)) {
      errors.push(`O parâmetro ${key} deve estar entre 0 e 1 (decimal).`);
    }
  });
  return errors;
};

export const validarCoordenacao = (coordenacao = []) => {
  const errors = [];
  coordenacao.forEach((item, idx) => {
    if (!item.cargo) errors.push(`Linha ${idx + 1}: cargo é obrigatório.`);
    if (!isPositive(item.subtotal))
      errors.push(`Linha ${idx + 1}: subtotal inválido.`);
    if (!isPositive(item.dias))
      errors.push(`Linha ${idx + 1}: dias deve ser positivo.`);
    if (!isPositive(item.quant))
      errors.push(`Linha ${idx + 1}: quantidade deve ser positiva.`);
  });
  return errors;
};

export const validarProfissionais = (profissionais = []) => {
  const errors = [];
  profissionais.forEach((item, idx) => {
    if (!item.cargo) errors.push(`Linha ${idx + 1}: cargo é obrigatório.`);
    if (!isPositive(item.prolabore))
      errors.push(`Linha ${idx + 1}: prolabore inválido.`);
    if (!isPositive(item.pessoas))
      errors.push(`Linha ${idx + 1}: pessoas deve ser >= 0.`);
    if (!isPositive(item.dias))
      errors.push(`Linha ${idx + 1}: dias deve ser >= 0.`);
  });
  return errors;
};

export const validarValoresUnicos = (valores = []) => {
  const errors = [];
  valores.forEach((item, idx) => {
    if (!item.item) errors.push(`Linha ${idx + 1}: item é obrigatório.`);
    if (!isPositive(item.valor))
      errors.push(`Linha ${idx + 1}: valor deve ser >= 0.`);
    if (!isPositive(item.pessoas ?? item.qtd))
      errors.push(`Linha ${idx + 1}: quantidade/pessoas deve ser >= 0.`);
  });
  return errors;
};

export const validarLogistica = (logistica = []) => {
  const errors = [];
  logistica.forEach((item, idx) => {
    if (!item.item) errors.push(`Linha ${idx + 1}: item é obrigatório.`);
    if (!isPositive(item.valor))
      errors.push(`Linha ${idx + 1}: valor deve ser >= 0.`);
    if (!isPositive(item.qtd))
      errors.push(`Linha ${idx + 1}: quantidade deve ser >= 0.`);
    if (!isPositive(item.dias))
      errors.push(`Linha ${idx + 1}: dias deve ser >= 0.`);
  });
  return errors;
};

// -----------------------------------------------------
// VALIDADOR COMPLETO
// -----------------------------------------------------

export const validarOrcamentoCompleto = (orcamento) => {
  const errors = [];

  errors.push(...validarMetadata(orcamento.metadata));
  errors.push(...validarParametros(orcamento.parametros));
  errors.push(...validarCoordenacao(orcamento.coordenacao));
  errors.push(...validarProfissionais(orcamento.profissionais));
  errors.push(...validarValoresUnicos(orcamento.valoresUnicos));
  errors.push(...validarLogistica(orcamento.logistica));

  return errors;
};

// -----------------------------------------------------
// OUTROS UTILITÁRIOS
// -----------------------------------------------------

export const orcamentoPodeSerSalvo = (orcamento) => {
  const erros = validarOrcamentoCompleto(orcamento);
  return { valido: erros.length === 0, errors: erros };
};

// Validadores rápidos usados diretamente nos inputs
export const validators = {
  parametros: {
    imposto: (v) => (!inRange(v, 0, 1) ? 'Deve estar entre 0-1 (0-100%)' : null),
    lucro: (v) => (!inRange(v, 0, 1) ? 'Deve estar entre 0-1 (0-100%)' : null),
    fundoGiro: (v) => (!inRange(v, 0, 1) ? 'Deve estar entre 0-1 (0-100%)' : null),
    encargosPessoal: (v) => (!inRange(v, 0, 1) ? 'Deve estar entre 0-1 (0-100%)' : null),
    despesasFiscais: (v) => (!inRange(v, 0, 1) ? 'Deve estar entre 0-1 (0-100%)' : null),
    comissaoCaptacao: (v) => (!inRange(v, 0, 1) ? 'Deve estar entre 0-1 (0-100%)' : null),
  },
};

