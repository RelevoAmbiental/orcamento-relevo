import React, { useState } from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { gerarPDF, gerarCSV, downloadArquivo } from '../utils/exportadores';

const ExportadorOrcamento = () => {
  const { orcamentoAtual, totais, carregando } = useOrcamento();
  const [exportando, setExportando] = useState(false);

  const handleExportarPDF = async () => {
    if (exportando) return;
    
    setExportando(true);
    try {
      const doc = await gerarPDF(orcamentoAtual, totais);
      const nomeArquivo = `Orcamento_${orcamentoAtual.metadata.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  const handleExportarCSV = () => {
    if (exportando) return;
    
    setExportando(true);
    try {
      const csv = gerarCSV(orcamentoAtual, totais);
      const nomeArquivo = `Orcamento_${orcamentoAtual.metadata.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadArquivo(csv, nomeArquivo, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      alert('Erro ao gerar CSV. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={handleExportarPDF}
        disabled={exportando || carregando}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        title="Exportar para PDF (formato de impressão)"
      >
        {exportando ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            Gerando...
          </>
        ) : (
          <>
            📄 PDF
          </>
        )}
      </button>
      
      <button
        onClick={handleExportarCSV}
        disabled={exportando || carregando}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        title="Exportar para CSV (Excel/Planilhas)"
      >
        {exportando ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            Gerando...
          </>
        ) : (
          <>
            📊 CSV
          </>
        )}
      </button>
    </div>
  );
};

export default ExportadorOrcamento;