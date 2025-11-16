// src/utils/exportadores.js
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType
} from "docx";

// ===============================================================
//  CSV UTF-8 COM BOM (compatível com Excel)
// ===============================================================
export function gerarCSV(orcamento, totais) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    return `"${String(v).replace(/"/g, '""')}"`;
  };

  let linhas = [];
  linhas.push("Categoria,Item,Quantidade,Dias,Valor Unitário,Subtotal");

  // Coordenação
  (orcamento.coordenacao || [])
    .map(item => ({
      ...item,
      subtotal: (item.dias / 30) * item.prolabore * item.quant
    }))
    .filter(item => item.subtotal > 0) // ✅ SOMENTE itens com subtotal > 0
    .forEach(item => {
      linhas.push([
        "Coordenação",
        escape(item.item),
        item.quant,
        item.dias,
        item.prolabore,
        item.subtotal.toFixed(2)
      ].join(","));
    });
  
  
  // Profissionais
  (orcamento.profissionais || [])
    .map(item => ({
      ...item,
      subtotal: (item.dias / 30) * item.prolabore * item.pessoas
    }))
    .filter(item => item.subtotal > 0) // ✅ SOMENTE itens com subtotal > 0
    .forEach(item => {
      linhas.push([
        "Profissionais",
        escape(item.categoria),
        item.pessoas,
        item.dias,
        item.prolabore,
        item.subtotal.toFixed(2)
      ].join(","));
    });
  
  
  // Valores Únicos
  (orcamento.valoresUnicos || [])
    .map(item => ({
      ...item,
      subtotal: item.valor * item.pessoas * item.dias
    }))
    .filter(item => item.subtotal > 0) // ✅ SOMENTE itens com subtotal > 0
    .forEach(item => {
      linhas.push([
        "Valores Únicos",
        escape(item.item),
        item.pessoas,
        item.dias,
        item.valor,
        item.subtotal.toFixed(2)
      ].join(","));
    });
  
  
  // Logística
  (orcamento.logistica || [])
    .map(item => ({
      ...item,
      subtotal: item.valor * item.qtd * item.dias
    }))
    .filter(item => item.subtotal > 0) // ✅ SOMENTE itens com subtotal > 0
    .forEach(item => {
      linhas.push([
        "Logística",
        escape(item.item),
        item.qtd,
        item.dias,
        item.valor,
        item.subtotal.toFixed(2)
      ].join(","));
    });


  // Totais finais
  linhas.push("");
  linhas.push(`Subtotal Geral,${(totais.subtotalGeral || 0).toFixed(2)}`);
  linhas.push(`Total Indiretos,${(totais.totalIndiretos || 0).toFixed(2)}`);
  linhas.push(`Impostos,${(totais.impostos || 0).toFixed(2)}`);
  linhas.push(`Desconto,${(totais.desconto || 0).toFixed(2)}`);
  linhas.push(`Total Final,${(totais.totalGeral || 0).toFixed(2)}`);

  return "\uFEFF" + linhas.join("\n");
}



// ===============================================================
//  DOWNLOAD UNIVERSAL
// ===============================================================
export function downloadArquivo(conteudo, nome, tipo) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = nome;
  a.click();

  URL.revokeObjectURL(url);
}



// ===============================================================
//  GERAR DOCX (compatível com o padrão da Relevo)
// ===============================================================
export async function gerarDOCX(orcamento, totais) {
  const toMoney = (v) =>
    `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

  const titulo = new Paragraph({
    text: "Orçamento – Relevo Consultoria Ambiental",
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 300 }
  });

  // Builder de tabelas
  const tabela = (titulo, dados) => {
    const linhas = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Item")] }),
          new TableCell({ children: [new Paragraph("Qtd")] }),
          new TableCell({ children: [new Paragraph("Dias")] }),
          new TableCell({ children: [new Paragraph("Valor")] }),
          new TableCell({ children: [new Paragraph("Subtotal")] }),
        ]
      }),

      ...dados.map(d => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(d.item || d.categoria || ""))] }),
          new TableCell({ children: [new Paragraph(String(d.quant || d.pessoas || d.qtd || "—"))] }),
          new TableCell({ children: [new Paragraph(String(d.dias || "—"))] }),
          new TableCell({ children: [new Paragraph(toMoney(d.valor || d.prolabore))] }),
          new TableCell({ children: [new Paragraph(toMoney(d.subtotal))] }),
        ]
      }))
    ];

    return [
      new Paragraph({
        text: titulo,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: linhas
      }),
      new Paragraph(" "), // espaçamento
    ];
  };

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        titulo,

        ...tabela("Coordenação",
          (orcamento.coordenacao || []).map(i => ({
            ...i,
            subtotal: (i.dias / 30) * i.prolabore * i.quant
          }))
        ),

        ...tabela("Profissionais",
          (orcamento.profissionais || []).map(i => ({
            ...i,
            subtotal: (i.dias / 30) * i.prolabore * i.pessoas
          }))
        ),

        ...tabela("Valores Únicos",
          (orcamento.valoresUnicos || []).map(i => ({
            ...i,
            subtotal: i.valor * i.pessoas * i.dias
          }))
        ),

        ...tabela("Logística",
          (orcamento.logistica || []).map(i => ({
            ...i,
            subtotal: i.valor * i.qtd * i.dias
          }))
        ),

        new Paragraph("Totais Gerais"),
        new Paragraph(`Subtotal Geral: ${toMoney(totais.subtotalGeral)}`),
        new Paragraph(`Total Indiretos: ${toMoney(totais.totalIndiretos)}`),
        new Paragraph(`Impostos: ${toMoney(totais.impostos)}`),
        new Paragraph(`Desconto: ${toMoney(totais.desconto)}`),
        new Paragraph(`TOTAL FINAL: ${toMoney(totais.totalGeral)}`)
      ]
    }]
  });

  return await Packer.toBlob(doc);
}
