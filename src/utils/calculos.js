export const subtotalItem = (i) =>
  Number(i.valor || 0) * Number(i.qtd || i.pessoas || 1) * Number(i.dias || 1);

export const somar = (itens) => (Array.isArray(itens) ? itens.reduce((a, i) => a + subtotalItem(i), 0) : 0);

export const calcularTotais = (orc) => {
  const custosOperacionais = somar(orc?.custosGerais) + somar(orc?.logistica) + somar(orc?.valoresUnicos);
  const honorarios = somar(orc?.coordenacao) + somar(orc?.profissionais);
  const bdi = 0;
  const total = custosOperacionais + honorarios + bdi;
  const descontoPercentual = Number(orc?.metadata?.descontoPercentual || 0);
  const totalComDesconto = total * (1 - descontoPercentual / 100);
  return { custosOperacionais, honorarios, bdi, total, totalComDesconto };
};
