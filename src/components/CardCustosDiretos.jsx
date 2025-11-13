import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';

const CardCustosDiretos = () => {
  const { totais } = useOrcamento();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">

      <h2 className="text-xl font-bold mb-4 text-relevo-text font-heading">
        Custos Diretos & Valor Total da Proposta
      </h2>

      {/* =============================== */}
      {/*       CUSTOS DIRETOS            */}
      {/* =============================== */}
      <div className="mb-6">
        <h3 className="font-semibold text-relevo-text/80 font-heading mb-2">
          Composição dos Custos Diretos
        </h3>

        <div className="space-y-2 text-sm">
          <Linha label="Coordenação" valor={totais.subtotalCoordenacao} />
          <Linha label="Profissionais" valor={totais.subtotalProfissionais} />
          <Linha label="Valores Únicos" valor={totais.subtotalValoresUnicos} />
          <Linha label="Logística" valor={totais.subtotalLogistica} />
        </div>

        <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between font-semibold">
          <span className="text-relevo-text font-heading">Subtotal Direto</span>
          <span className="text-relevo-blue font-sans">
            R$ {formatarValorBR(totais.subtotalGeral)}
          </span>
        </div>
      </div>

      {/* =============================== */}
      {/*         TOTAL FINAL              */}
      {/* =============================== */}
      <div>
        <h3 className="font-semibold text-relevo-text/80 font-heading mb-2">
          Valor Final da Proposta
        </h3>

        <Linha label="Total Antes do Desconto" valor={totais.totalAntesDesconto} />
        <Linha label="Desconto Aplicado" valor={totais.desconto} />

        <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between text-lg font-bold">
          <span className="text-relevo-text font-heading">Total Final</span>
          <span className="text-relevo-green font-sans">
            R$ {formatarValorBR(totais.totalGeral)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Linha = ({ label, valor }) => (
  <div className="flex justify-between border-b pb-1">
    <span className="text-relevo-text/70 font-sans">{label}:</span>
    <span className="font-medium">R$ {formatarValorBR(valor)}</span>
  </div>
);

export default CardCustosDiretos;
