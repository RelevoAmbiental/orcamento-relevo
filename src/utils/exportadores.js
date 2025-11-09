// src/utils/exportadores.js - VERSÃO DEFINITIVA ROBUSTA
import jsPDF from 'jspdf';
import { formatarValorBR, formatarPercentual } from './formatters';

class PDFGenerator {
  constructor(orcamento, totais) {
    this.doc = new jsPDF();
    this.orcamento = orcamento;
    this.totais = totais;
    this.margin = 20;
    this.y = this.margin;
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    
    // Configurações de estilo
    this.styles = {
      primary: [46, 125, 50],    // #2E7D32
      secondary: [0, 151, 167],  // #0097A7
      accent: [255, 107, 53],    // #FF6B35
      text: [51, 51, 51],        // #333333
      border: [221, 221, 221]    // #DDDDDD
    };
  }

  // ... (todos os métodos da classe PDFGenerator permanecem iguais)
  // Método para verificar quebra de página
  checkPageBreak(additionalHeight = 0) {
    if (this.y + additionalHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.y = this.margin;
      return true;
    }
    return false;
  }

  // Método para adicionar texto
  addText(text, x = this.margin, size = 10, color = this.styles.text, align = 'left') {
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
    
    let xPos = x;
    if (align === 'center') {
      const textWidth = this.doc.getTextWidth(text);
      xPos = (this.pageWidth - textWidth) / 2;
    } else if (align === 'right') {
      const textWidth = this.doc.getTextWidth(text);
      xPos = this.pageWidth - this.margin - textWidth;
    }
    
    this.doc.text(text, xPos, this.y);
    this.y += size / 2 + 2;
  }

  // Método para adicionar título
  addTitle(text, size = 16) {
    this.checkPageBreak(20);
    this.addText(text, this.margin, size, this.styles.primary);
    this.y += 5;
  }

  // Método para adicionar linha divisória
  addDivider() {
    this.y += 5;
    this.doc.setDrawColor(...this.styles.border);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 10;
  }

  // Método para criar tabela simples
  addTable(headers, rows, columnWidths = null) {
    this.checkPageBreak(rows.length * 8 + 20);
    
    const startY = this.y;
    const tableWidth = this.pageWidth - (2 * this.margin);
    const defaultColWidth = tableWidth / headers.length;
    const colWidths = columnWidths || headers.map(() => defaultColWidth);
    
    let currentY = startY;
    
    // Cabeçalho da tabela
    this.doc.setFillColor(...this.styles.primary);
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.setFont(undefined, 'bold');
    
    let currentX = this.margin;
    headers.forEach((header, index) => {
      this.doc.rect(currentX, currentY, colWidths[index], 8, 'F');
      this.doc.text(header, currentX + 2, currentY + 5);
      currentX += colWidths[index];
    });
    
    currentY += 8;
    
    // Linhas da tabela
    this.doc.setTextColor(...this.styles.text);
    this.doc.setFont(undefined, 'normal');
    
    rows.forEach((row, rowIndex) => {
      // Alternar cores das linhas para melhor legibilidade
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(this.margin, currentY, tableWidth, 8, 'F');
      }
      
      currentX = this.margin;
      row.forEach((cell, cellIndex) => {
        this.doc.text(cell.toString(), currentX + 2, currentY + 5);
        currentX += colWidths[cellIndex];
      });
      
      currentY += 8;
      
      // Verificar quebra de página durante a tabela
      if (currentY > this.pageHeight - this.margin - 20) {
        this.doc.addPage();
        currentY = this.margin;
        
        // Redesenhar cabeçalho na nova página
        this.doc.setFillColor(...this.styles.primary);
        this.doc.setTextColor(255, 255, 255);
        currentX = this.margin;
        headers.forEach((header, index) => {
          this.doc.rect(currentX, currentY, colWidths[index], 8, 'F');
          this.doc.text(header, currentX + 2, currentY + 5);
          currentX += colWidths[index];
        });
        currentY += 8;
        this.doc.setTextColor(...this.styles.text);
      }
    });
    
    this.y = currentY + 10;
  }

  // Gerar cabeçalho do documento
  generateHeader() {
    this.addText('RELEVO CONSULTORIA AMBIENTAL', this.margin, 16, this.styles.primary);
    this.addText('SISTEMA DE ORÇAMENTOS', this.margin, 12, this.styles.secondary);
    this.addDivider();
  }

  // Gerar informações do orçamento
  generateMetadata() {
    this.addTitle('INFORMAÇÕES DO ORÇAMENTO', 14);
    
    this.addText(`Nome: ${this.orcamento.metadata.nome}`, this.margin, 10);
    this.addText(`Cliente: ${this.orcamento.metadata.cliente}`, this.margin, 10);
    this.addText(`Data: ${new Date(this.orcamento.metadata.data).toLocaleDateString('pt-BR')}`, this.margin, 10);
    this.addText(`Versão: ${this.orcamento.metadata.versao}`, this.margin, 10);
    
    if (this.orcamento.metadata.desconto > 0) {
      this.addText(`Desconto: ${this.orcamento.metadata.desconto}%`, this.margin, 10, this.styles.accent);
    }
    
    this.addDivider();
  }

  // Gerar resumo financeiro
  generateFinancialSummary() {
    this.addTitle('RESUMO FINANCEIRO', 14);
    
    const headers = ['Descrição', 'Valor (R$)'];
    const colWidths = [120, 50];
    
    const rows = [
      ['Coordenação', formatarValorBR(this.totais.subtotalCoordenacao)],
      ['Profissionais', formatarValorBR(this.totais.subtotalProfissionais)],
      ['Valores Únicos', formatarValorBR(this.totais.subtotalValoresUnicos)],
      ['Logística', formatarValorBR(this.totais.subtotalLogistica)],
      ['', ''],
      ['SUBTOTAL GERAL', formatarValorBR(this.totais.subtotalGeral)],
      ['Encargos de Pessoal', formatarValorBR(this.totais.encargosPessoal)],
      ['Custo Total', formatarValorBR(this.totais.custoTotal)],
      ['', ''],
      ['Lucro', formatarValorBR(this.totais.lucro)],
      ['Fundo de Giro', formatarValorBR(this.totais.fundoGiro)],
      ['Impostos', formatarValorBR(this.totais.impostos)],
      ['Despesas Fiscais', formatarValorBR(this.totais.despesasFiscais)],
      ['Comissão Captação', formatarValorBR(this.totais.comissaoCaptacao)],
      ['', ''],
      ['TOTAL ANTES DO DESCONTO', formatarValorBR(this.totais.totalAntesDesconto)]
    ];

    if (this.totais.desconto > 0) {
      rows.push(['DESCONTO', `-${formatarValorBR(this.totais.desconto)}`]);
    }

    rows.push(['TOTAL GERAL', formatarValorBR(this.totais.totalGeral)]);

    this.addTable(headers, rows, colWidths);
    this.addDivider();
  }

  // Gerar parâmetros de cálculo
  generateParameters() {
    this.addTitle('PARÂMETROS DE CÁLCULO', 14);
    
    const headers = ['Parâmetro', 'Valor'];
    const colWidths = [100, 70];
    
    const rows = Object.entries(this.orcamento.parametros).map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      formatarPercentual(value)
    ]);

    this.addTable(headers, rows, colWidths);
  }

  // Gerar detalhamento por categoria
  generateCategoryDetail(categoria, dados, headers, mapper) {
    const itensComValor = dados.filter(item => {
      const total = mapper(item).total;
      return total > 0;
    });

    if (itensComValor.length === 0) return;

    this.checkPageBreak(30);
    this.addTitle(categoria.toUpperCase(), 12);

    const rows = itensComValor.map(item => mapper(item).row);
    this.addTable(headers, rows);
  }

  // Gerar todas as categorias
  generateAllCategories() {
    const categorias = [
      {
        nome: 'COORDENAÇÃO',
        dados: this.orcamento.coordenacao,
        headers: ['Cargo', 'Profissional', 'Subtotal', 'Quant.', 'Dias', 'Total'],
        mapper: (item) => {
          const total = (item.dias / 30) * item.subtotal * item.quant;
          return {
            total,
            row: [
              item.cargo,
              item.profissional,
              formatarValorBR(item.subtotal),
              item.quant.toString(),
              item.dias.toString(),
              formatarValorBR(total)
            ]
          };
        }
      },
      {
        nome: 'PROFISSIONAIS',
        dados: this.orcamento.profissionais,
        headers: ['Cargo', 'Prolabore', 'Pessoas', 'Dias', 'Total'],
        mapper: (item) => {
          const total = (item.dias / 30) * item.prolabore * item.pessoas;
          return {
            total,
            row: [
              item.cargo,
              formatarValorBR(item.prolabore),
              item.pessoas.toString(),
              item.dias.toString(),
              formatarValorBR(total)
            ]
          };
        }
      },
      {
        nome: 'VALORES ÚNICOS',
        dados: this.orcamento.valoresUnicos,
        headers: ['Item', 'Valor Unit.', 'Pessoas', 'Dias', 'Total'],
        mapper: (item) => {
          const total = item.valor * item.pessoas * item.dias;
          return {
            total,
            row: [
              item.item,
              formatarValorBR(item.valor),
              item.pessoas.toString(),
              item.dias.toString(),
              formatarValorBR(total)
            ]
          };
        }
      },
      {
        nome: 'LOGÍSTICA',
        dados: this.orcamento.logistica,
        headers: ['Item', 'Valor', 'Unidade', 'Quant.', 'Dias', 'Total'],
        mapper: (item) => {
          const total = item.valor * item.qtd * item.dias;
          return {
            total,
            row: [
              item.item,
              formatarValorBR(item.valor),
              item.unidade,
              item.qtd.toString(),
              item.dias.toString(),
              formatarValorBR(total)
            ]
          };
        }
      }
    ];

    categorias.forEach(categoria => {
      this.generateCategoryDetail(categoria.nome, categoria.dados, categoria.headers, categoria.mapper);
    });
  }

  // Adicionar rodapé em todas as páginas
  addFooter() {
    const totalPages = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...this.styles.text);
      this.doc.text(
        `Página ${i} de ${totalPages} • Gerado em ${new Date().toLocaleDateString('pt-BR')} • Relevo Consultoria Ambiental`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  // Gerar PDF completo
  generate() {
    this.generateHeader();
    this.generateMetadata();
    this.generateFinancialSummary();
    this.generateParameters();
    this.generateAllCategories();
    this.addFooter();
    
    return this.doc;
  }
}

// Função principal para gerar PDF
export const gerarPDF = async (orcamento, totais) => {
  try {
    const generator = new PDFGenerator(orcamento, totais);
    const doc = generator.generate();
    return doc;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar PDF. Tente novamente.');
  }
};

// CSV (mantido da versão anterior - funciona perfeitamente)
export const gerarCSV = (orcamento, totais) => {
  let csv = '';

  // CABEÇALHO DO CSV
  csv += 'RELEVO CONSULTORIA AMBIENTAL - ORÇAMENTO\n';
  csv += `Nome: ${orcamento.metadata.nome}\n`;
  csv += `Cliente: ${orcamento.metadata.cliente}\n`;
  csv += `Data: ${new Date(orcamento.metadata.data).toLocaleDateString('pt-BR')}\n`;
  csv += `Versão: ${orcamento.metadata.versao}\n`;
  if (orcamento.metadata.desconto > 0) {
    csv += `Desconto: ${orcamento.metadata.desconto}%\n`;
  }
  csv += '\n';

  // RESUMO FINANCEIRO
  csv += 'RESUMO FINANCEIRO\n';
  csv += 'Descrição,Valor (R$)\n';
  csv += `Coordenação,${formatarValorBR(totais.subtotalCoordenacao)}\n`;
  csv += `Profissionais,${formatarValorBR(totais.subtotalProfissionais)}\n`;
  csv += `Valores Únicos,${formatarValorBR(totais.subtotalValoresUnicos)}\n`;
  csv += `Logística,${formatarValorBR(totais.subtotalLogistica)}\n`;
  csv += `Subtotal Geral,${formatarValorBR(totais.subtotalGeral)}\n`;
  csv += `Encargos de Pessoal,${formatarValorBR(totais.encargosPessoal)}\n`;
  csv += `Custo Total,${formatarValorBR(totais.custoTotal)}\n`;
  csv += `Lucro,${formatarValorBR(totais.lucro)}\n`;
  csv += `Fundo de Giro,${formatarValorBR(totais.fundoGiro)}\n`;
  csv += `Impostos,${formatarValorBR(totais.impostos)}\n`;
  csv += `Despesas Fiscais,${formatarValorBR(totais.despesasFiscais)}\n`;
  csv += `Comissão Captação,${formatarValorBR(totais.comissaoCaptacao)}\n`;
  csv += `Total Antes do Desconto,${formatarValorBR(totais.totalAntesDesconto)}\n`;
  if (totais.desconto > 0) {
    csv += `Desconto,-${formatarValorBR(totais.desconto)}\n`;
  }
  csv += `TOTAL GERAL,${formatarValorBR(totais.totalGeral)}\n`;
  csv += '\n';

  // PARÂMETROS
  csv += 'PARÂMETROS DE CÁLCULO\n';
  csv += 'Parâmetro,Valor\n';
  Object.entries(orcamento.parametros).forEach(([key, value]) => {
    const nomeParametro = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    csv += `${nomeParametro},${formatarPercentual(value)}\n`;
  });

  return csv;
};

// Função para download de arquivo
export const downloadArquivo = (conteudo, nomeArquivo, tipo = 'text/csv') => {
  const blob = new Blob([conteudo], { type: tipo });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};