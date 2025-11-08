// src/components/ExportadorOrcamento.jsx
import React, { useState } from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { gerarPDF, gerarCSV, downloadArquivo } from '../utils/exportadores';

const ExportadorOrcamento = () => {
  const { orcamentoAtual, totais } = useOrcamento();
  const [exportando, setExportando] = useState(false);

  const nomeBase = () => {
    const nome = (orcamentoAtual?.metadata?.nome || 'Orcamento').replace(/\s+/g, '_');
    const data = new Date().toISOString().split('T')[0];
    return `${nome}_${data}`;
  };

  const handleExportarPDF = async () => {
    if (exportando) return;
    setExportando(true);
    try {
      const doc = await gerarPDF(orcamentoAtual, totais);
      doc.save(`${nomeBase()}.pdf`);
    } finally {
      setExportando(false);
    }
  };

  const handleExportarCSV = async () => {
    if (exportando) return;
    setExportando(true);
    try {
      const csv = await gerarCSV(orcamentoAtual, totais);
      downloadArquivo(`${nomeBase()}.csv`, csv, 'text/csv;charset=utf-8;');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportarPDF}
        className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm"
      >
        📄 PDF
      </button>
      <button
        onClick={handleExportarCSV}
        className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition text-sm"
      >
        📊 CSV
      </button>
    </div>
  );
};

export default ExportadorOrcamento;
