// src/utils/exportadores.js
import jsPDF from 'jspdf';

// Helpers
export const formatarBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export const downloadArquivo = (nome, conteudo, tipo = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Gera um PDF simples e estável com jsPDF
export const gerarPDF = async (orcamento, totais) => {
  const doc = new jsPDF();
  let y = 20;

  const write = (texto, opts = {}) => {
    const { size = 12, bold = false } = opts;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(texto, 20, y);
    y += size < 12 ? 8 : 10;
    if (y > 280) { doc.addPage(); y = 20; }
  };

  write('Relevo Consultoria Ambiental', { size: 14, bold: true });
  write('Sistema de Orçamentos', { size: 12 });
  write('');

  const meta = orcamento?.metadata || {};
  write(`Nome: ${meta.nome || '-'}`);
  write(`Cliente: ${meta.cliente || '-'}`);
  write(`Data: ${meta.data ? new Date(meta.data).toLocaleDateString('pt-BR') : '-'}`);
  write('');

  const seções = [
    ['Custos Gerais', orcamento?.custosGerais],
    ['Coordenação', orcamento?.coordenacao],
    ['Profissionais', orcamento?.profissionais],
    ['Valores Únicos', orcamento?.valoresUnicos],
    ['Logística', orcamento?.logistica]
  ];

  seções.forEach(([titulo, itens]) => {
    if (!Array.isArray(itens) || !itens.length) return;
    write(titulo, { bold: true });
    itens.forEach((i) => {
      const linha = [
        i.item || i.nome || '-',
        i.unidade ? ` (${i.unidade})` : '',
        ' — ',
        formatarBRL((i.valor || 0) * (i.qtd || i.pessoas || 1) * (i.dias || 1))
      ].join('');
      write(linha, { size: 11 });
    });
    write('');
  });

  if (totais) {
    write('Totais', { bold: true });
    write(`Custos Operacionais: ${formatarBRL(totais.custosOperacionais || 0)}`);
    write(`Honorários Técnicos: ${formatarBRL(totais.honorarios || 0)}`);
    write(`BDI: ${formatarBRL(totais.bdi || 0)}`);
    write(`Total: ${formatarBRL(totais.total || 0)}`, { bold: true });
  }

  return doc;
};

// Gera CSV simplificado
export const gerarCSV = async (orcamento, totais) => {
  const linhas = [];
  const push = (arr) => linhas.push(arr.map(v => (v ?? '')).join(';'));

  push(['Seção', 'Item', 'Unidade', 'Valor', 'Qtd/Pessoas', 'Dias', 'Subtotal']);

  const addSecao = (nome, itens) => {
    if (!Array.isArray(itens)) return;
    itens.forEach(i => {
      const subtotal = (Number(i.valor || 0) * Number(i.qtd || i.pessoas || 1) * Number(i.dias || 1));
      push([nome, i.item || i.nome || '-', i.unidade || '-', String(i.valor || 0), String(i.qtd || i.pessoas || 1), String(i.dias || 1), String(subtotal)]);
    });
  };

  addSecao('Custos Gerais', orcamento?.custosGerais);
  addSecao('Coordenação', orcamento?.coordenacao);
  addSecao('Profissionais', orcamento?.profissionais);
  addSecao('Valores Únicos', orcamento?.valoresUnicos);
  addSecao('Logística', orcamento?.logistica);

  if (totais) {
    linhas.push([]);
    push(['Totais']);
    push(['Custos Operacionais', String(totais.custosOperacionais || 0)]);
    push(['Honorários Técnicos', String(totais.honorarios || 0)]);
    push(['BDI', String(totais.bdi || 0)]);
    push(['Total', String(totais.total || 0)]);
  }

  return linhas.join('\n');
};

export default { gerarPDF, gerarCSV, downloadArquivo };
