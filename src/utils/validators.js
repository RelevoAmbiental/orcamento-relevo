// src/utils/validators.js
// Sistema centralizado de validações para orçamentos

export const validators = {
  // Validações gerais
  required: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },

  number: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') {
      return null; // Campos numéricos podem ser vazios
    }
    if (isNaN(Number(value))) {
      return `${fieldName} deve ser um número válido`;
    }
    return null;
  },

  minValue: (value, min, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (Number(value) < min) {
      return `${fieldName} deve ser maior ou igual a ${min}`;
    }
    return null;
  },

  maxValue: (value, max, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (Number(value) > max) {
      return `${fieldName} deve ser menor ou igual a ${max}`;
    }
    return null;
  },

  range: (value, min, max, fieldName = 'Campo') => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numValue = Number(value);
    if (numValue < min || numValue > max) {
      return `${fieldName} deve estar entre ${min} e ${max}`;
    }
    return null;
  },

  // Validações específicas para metadata
  metadata: {
    nome: (value) => {
      const requiredError = validators.required(value, 'Nome do orçamento');
      if (requiredError) return requiredError;
      
      if (value.length < 3) {
        return 'Nome do orçamento deve ter pelo menos 3 caracteres';
      }
      if (value.length > 100) {
        return 'Nome do orçamento deve ter no máximo 100 caracteres';
      }
      return null;
    },

    cliente: (value) => {
      const requiredError = validators.required(value, 'Cliente');
      if (requiredError) return requiredError;
      
      if (value.length < 2) {
        return 'Nome do cliente deve ter pelo menos 2 caracteres';
      }
      return null;
    },

    data: (value) => {
      return validators.required(value, 'Data');
    },

    desconto: (value) => {
      const numberError = validators.number(value, 'Desconto');
      if (numberError) return numberError;
      
      return validators.range(value, 0, 100, 'Desconto');
    }
  },

  // Validações para parâmetros
  parametros: {
    imposto: (value) => validators.range(value, 0, 1, 'Imposto'),
    lucro: (value) => validators.range(value, 0, 1, 'Lucro'),
    fundoGiro: (value) => validators.range(value, 0, 1, 'Fundo de Giro'),
    encargosPessoal: (value) => validators.range(value, 0, 1, 'Encargos de Pessoal'),
    despesasFiscais: (value) => validators.range(value, 0, 1, 'Despesas Fiscais'),
    comissaoCaptacao: (value) => validators.range(value, 0, 1, 'Comissão de Captação')
  },

  // Validações para coordenação
  coordenacao: {
    quant: (value) => validators.minValue(value, 0, 'Quantidade'),
    dias: (value) => validators.minValue(value, 0, 'Dias'),
    subtotal: (value) => validators.minValue(value, 0, 'Subtotal')
  },

  // Validações para profissionais
  profissionais: {
    pessoas: (value) => validators.minValue(value, 0, 'Número de pessoas'),
    dias: (value) => validators.minValue(value, 0, 'Dias de trabalho'),
    prolabore: (value) => validators.minValue(value, 0, 'Prolabore')
  },

  // Validações para valores únicos
  valoresUnicos: {
    valor: (value) => validators.minValue(value, 0, 'Valor'),
    pessoas: (value) => validators.minValue(value, 0, 'Número de pessoas'),
    dias: (value) => validators.minValue(value, 0, 'Dias')
  },

  // Validações para logística
  logistica: {
    valor: (value) => validators.minValue(value, 0, 'Valor'),
    qtd: (value) => validators.minValue(value, 0, 'Quantidade'),
    dias: (value) => validators.minValue(value, 0, 'Dias')
  }
};

// Função principal para validar orçamento completo
export const validarOrcamentoCompleto = (orcamento) => {
  const errors = [];

  // Validar metadata
  if (orcamento.metadata) {
    const metadataErrors = validarMetadata(orcamento.metadata);
    errors.push(...metadataErrors);
  }

  // Validar parâmetros
  if (orcamento.parametros) {
    const parametrosErrors = validarParametros(orcamento.parametros);
    errors.push(...parametrosErrors);
  }

  // Validar coordenação
  if (orcamento.coordenacao) {
    const coordenacaoErrors = validarCoordenacao(orcamento.coordenacao);
    errors.push(...coordenacaoErrors);
  }

  // Validar profissionais
  if (orcamento.profissionais) {
    const profissionaisErrors = validarProfissionais(orcamento.profissionais);
    errors.push(...profissionaisErrors);
  }

  // Validar valores únicos
  if (orcamento.valoresUnicos) {
    const valoresUnicosErrors = validarValoresUnicos(orcamento.valoresUnicos);
    errors.push(...valoresUnicosErrors);
  }

  // Validar logística
  if (orcamento.logistica) {
    const logisticaErrors = validarLogistica(orcamento.logistica);
    errors.push(...logisticaErrors);
  }

  return errors;
};

// Funções de validação específicas por seção
export const validarMetadata = (metadata) => {
  const errors = [];
  
  if (!metadata) return ['Metadata não encontrada'];

  const nomeError = validators.metadata.nome(metadata.nome);
  if (nomeError) errors.push(nomeError);

  const clienteError = validators.metadata.cliente(metadata.cliente);
  if (clienteError) errors.push(clienteError);

  const dataError = validators.metadata.data(metadata.data);
  if (dataError) errors.push(dataError);

  const descontoError = validators.metadata.desconto(metadata.desconto);
  if (descontoError) errors.push(descontoError);

  return errors;
};

export const validarParametros = (parametros) => {
  const errors = [];
  
  if (!parametros) return ['Parâmetros não encontrados'];

  Object.keys(parametros).forEach(key => {
    if (validators.parametros[key]) {
      const error = validators.parametros[key](parametros[key]);
      if (error) errors.push(error);
    }
  });

  return errors;
};

export const validarCoordenacao = (coordenacao) => {
  const errors = [];
  
  if (!coordenacao || !Array.isArray(coordenacao)) {
    return ['Dados de coordenação inválidos'];
  }

  coordenacao.forEach((item, index) => {
    const prefix = `Coordenador ${index + 1} (${item.cargo}):`;

    const quantError = validators.coordenacao.quant(item.quant);
    if (quantError) errors.push(`${prefix} ${quantError}`);

    const diasError = validators.coordenacao.dias(item.dias);
    if (diasError) errors.push(`${prefix} ${diasError}`);

    const subtotalError = validators.coordenacao.subtotal(item.subtotal);
    if (subtotalError) errors.push(`${prefix} ${subtotalError}`);
  });

  return errors;
};

export const validarProfissionais = (profissionais) => {
  const errors = [];
  
  if (!profissionais || !Array.isArray(profissionais)) {
    return ['Dados de profissionais inválidos'];
  }

  profissionais.forEach((item, index) => {
    const prefix = `Profissional ${index + 1} (${item.cargo}):`;

    const pessoasError = validators.profissionais.pessoas(item.pessoas);
    if (pessoasError) errors.push(`${prefix} ${pessoasError}`);

    const diasError = validators.profissionais.dias(item.dias);
    if (diasError) errors.push(`${prefix} ${diasError}`);

    const prolaboreError = validators.profissionais.prolabore(item.prolabore);
    if (prolaboreError) errors.push(`${prefix} ${prolaboreError}`);
  });

  return errors;
};

export const validarValoresUnicos = (valoresUnicos) => {
  const errors = [];
  
  if (!valoresUnicos || !Array.isArray(valoresUnicos)) {
    return ['Dados de valores únicos inválidos'];
  }

  valoresUnicos.forEach((item, index) => {
    const prefix = `Valor único ${index + 1} (${item.item}):`;

    const valorError = validators.valoresUnicos.valor(item.valor);
    if (valorError) errors.push(`${prefix} ${valorError}`);

    const pessoasError = validators.valoresUnicos.pessoas(item.pessoas);
    if (pessoasError) errors.push(`${prefix} ${pessoasError}`);

    const diasError = validators.valoresUnicos.dias(item.dias);
    if (diasError) errors.push(`${prefix} ${diasError}`);
  });

  return errors;
};

export const validarLogistica = (logistica) => {
  const errors = [];
  
  if (!logistica || !Array.isArray(logistica)) {
    return ['Dados de logística inválidos'];
  }

  logistica.forEach((item, index) => {
    const prefix = `Logística ${index + 1} (${item.item}):`;

    const valorError = validators.logistica.valor(item.valor);
    if (valorError) errors.push(`${prefix} ${valorError}`);

    const qtdError = validators.logistica.qtd(item.qtd);
    if (qtdError) errors.push(`${prefix} ${qtdError}`);

    const diasError = validators.logistica.dias(item.dias);
    if (diasError) errors.push(`${prefix} ${diasError}`);
  });

  return errors;
};

// Utilitário para formatar erros para exibição
export const formatarErrosParaExibicao = (errors) => {
  if (errors.length === 0) return null;
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};

// Verificar se o orçamento é válido para salvar
export const orcamentoPodeSerSalvo = (orcamento) => {
  const errors = validarOrcamentoCompleto(orcamento);
  return {
    valido: errors.length === 0,
    errors: errors
  };
};