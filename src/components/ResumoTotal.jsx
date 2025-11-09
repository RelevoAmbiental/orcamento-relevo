import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';

const ResumoTotal = () => {
  const { totais } = useOrcamento();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-relevo-text font-heading">Resumo Total do Orçamento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subtotais */}
        <div className="space-y-3">
          <h3 className="font-semibold text-relevo-text/80 font-heading">Subtotais por Categoria</h3>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Coordenação:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.subtotalCoordenacao)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Profissionais:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.subtotalProfissionais)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Valores Únicos:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.subtotalValoresUnicos)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Logística:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.subtotalLogistica)}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-300 pb-2 font-semibold">
            <span className="text-relevo-text font-heading">Subtotal Geral:</span>
            <span className="text-relevo-blue font-sans">R$ {formatarValorBR(totais.subtotalGeral)}</span>
          </div>
        </div>

        {/* Custos Indiretos e Total */}
        <div className="space-y-3">
          <h3 className="font-semibold text-relevo-text/80 font-heading">Custos Indiretos e Total</h3>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Despesas Fiscais:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.despesasFiscais)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Lucro:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.lucro)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Fundo de Giro:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.fundoGiro)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Encargos Pessoal:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.encargosPessoal)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-relevo-text/70 font-sans">Impostos:</span>
            <span className="font-medium">R$ {formatarValorBR(totais.impostos)}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-300 pb-2 font-semibold text-lg">
            <span className="text-relevo-text font-heading">TOTAL GERAL:</span>
            <span className="text-relevo-green font-sans">R$ {formatarValorBR(totais.totalGeral)}</span>
          </div>
        </div>
      </div>

      {/* Margens */}
      <div className="mt-6 p-4 bg-relevo-light-gray rounded-lg">
        <h3 className="font-semibold text-relevo-blue font-heading mb-2">Análise de Margens</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-relevo-blue font-sans font-semibold">
              {((totais.lucro / totais.totalGeral) * 100).toFixed(1).replace('.', ',')}%
            </div>
            <div className="text-relevo-blue/80 font-sans text-xs">Margem de Lucro</div>
          </div>
          <div className="text-center">
            <div className="text-relevo-blue font-sans font-semibold">
              {((totais.impostos / totais.totalGeral) * 100).toFixed(1).replace('.', ',')}%
            </div>
            <div className="text-relevo-blue/80 font-sans text-xs">Impostos</div>
          </div>
          <div className="text-center">
            <div className="text-relevo-blue font-sans font-semibold">
              {((totais.subtotalGeral / totais.totalGeral) * 100).toFixed(1).replace('.', ',')}%
            </div>
            <div className="text-relevo-blue/80 font-sans text-xs">Custos Diretos</div>
          </div>
          <div className="text-center">
            <div className="text-relevo-blue font-sans font-semibold">
              {100 - ((totais.subtotalGeral / totais.totalGeral) * 100).toFixed(1).replace('.', ',')}%
            </div>
            <div className="text-relevo-blue/80 font-sans text-xs">Custos Indiretos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoTotal;