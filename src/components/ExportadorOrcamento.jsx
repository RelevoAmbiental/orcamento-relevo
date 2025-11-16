import React, { useState } from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { gerarDOCX, gerarCSV, downloadArquivo } from '../utils/exportadores';

const ExportadorOrcamento = () => {
  const { orcamentoAtual, totais, carregando } = useOrcamento();
  const [exportando, setExportando] = useState(false);

  const handleExportarDOCX = async () => {
    if (exportando) return;
  
    setExportando(true);
    try {
      const blob = await gerarDOCX(orcamentoAtual, totais);
  
      const nomeArquivo =
        `Orcamento_${orcamentoAtual.metadata.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  
      downloadArquivo(
        blob,
        nomeArquivo,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
  
    } catch (error) {
      console.error('Erro ao gerar DOCX:', error);
      alert('Erro ao gerar DOCX. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };


  const handleExportarCSV = () => {
    if (exportando) return;
    
    setExportando(true);
    try {
      const csv = gerarCSV(orcamentoAtual, totais);

      // CSV COM BOM (acentuação perfeita no Excel)
      const nomeArquivo = `Orcamento_${orcamentoAtual.metadata.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadArquivo("\uFEFF" + csv, nomeArquivo, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      alert('Erro ao gerar CSV. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* DOCX */}
      <button
        onClick={handleExportarDOCX}
        disabled={exportando || carregando}
        className="px-6 py-3 text-white bg-[#2E3E31] rounded-md hover:bg-[#3CC373] transition shadow-md font-sans min-w-[140px]"
      >
        {exportando ? "Gerando..." : "📄 DOCX"}
      </button>

      {/* CSV */}
      <button
        onClick={handleExportarCSV}
        disabled={exportando || carregando}
        className="px-6 py-3 text-white bg-[#2E3E31] rounded-md hover:bg-[#3CC373] transition shadow-md font-sans min-w-[140px]"
      >
        {exportando ? "Gerando..." : "📊 CSV"}
      </button>
    </div>
  );
};

export default ExportadorOrcamento;
