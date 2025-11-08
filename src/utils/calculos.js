// src/utils/calculos.js
export const subtotalItem = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || i?.pessoas || 1) * Number(i?.dias || 1);

export const somar = (itens) =>
  Array.isArray(itens) ? itens.reduce((a, i) => a + subtotalItem(i), 0) : 0;

export const calcularTotais = (orc) => {
  const custosOperacionais =
    somar(orc?.custosGerais) + somar(orc?.logistica) + somar(orc?.valoresUnicos);

  const honorarios = somar(orc?.coordenacao) + somar(orc?.profissionais);

  const base = custosOperacionais + honorarios;

  const impostos          = base * Number(orc?.parametros?.imposto || 0);
  const lucro             = base * Number(orc?.parametros?.lucro || 0);
  const fundoGiro         = base * Number(orc?.parametros?.fundoGiro || 0);
  const encargosPessoal   = base * Number(orc?.parametros?.encargosPessoal || 0);
  const despesasFiscais   = base * Number(orc?.parametros?.despesasFiscais || 0);
  const comissaoCaptacao  = base * Number(orc?.parametros?.comissaoCaptacao || 0);

  const totalIndiretos = impostos + lucro + fundoGiro + encargosPessoal + despesasFiscais + comissaoCaptacao;

  const bdi = 0;
  const total = base + totalIndiretos + bdi;

  const descontoPercentual = Number(orc?.metadata?.descontoPercentual || 0) / 100;
  const totalComDesconto = total * (1 - (descontoPercentual > 0 ? descontoPercentual : 0));

  return {
    custosOperacionais,
    honorarios,
    bdi,
    base,
    impostos,
    lucro,
    fundoGiro,
    encargosPessoal,
    despesasFiscais,
    comissaoCaptacao,
    totalIndiretos,
    total,
    totalComDesconto,
  };
};
