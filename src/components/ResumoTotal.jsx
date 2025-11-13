import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';

const ResumoTotal = () => {
  const { totais } = useOrcamento();

  // Cálculo de percentuais
  const pct = (v) =>
    totais.totalGeral > 0 ? ((v / totais.totalGeral) * 100).toFixed(1).replace('.', ',') : '0,0';

  const subtotalIndiretos =
    totais.encargosPessoal +
    totais.fundoGiro +
    totais.lucro +
    totais.despesasFiscais +
    totais.comissaoCaptacao;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      
      <h2 className="text-xl font-bold mb-6 text-relevo-text font-heading">
        Resumo Consolidado do Orçamento
      </h2>

      {/* =============================== */}
      {/*       BLOCOS DE CUSTOS DIRETOS  */}
      {/* =============================== */}

      <div className="mb-8">
        <h3 className="font-semibold text-relevo-text/80 font-heading mb-3">
          Custos Diretos (por categoria)
        </h3>

        <div className="space-y-2">
          <Linha label="Coordenação" valor={totais.subtotalCoordenacao} />
          <Linha label="Profissionais" valor={totais.subtotalProfissionais} />
          <Linha label="Valores Únicos" valor={totais.subtotalValoresUnicos} />
          <Linha label="Logística" valor={totais.subtotalLogistica} />

          <LinhaTotal
            label="Subtotal Geral de Custos Diretos"
            valor={totais.subtotalGeral}
            highlight
          />
        </div>
      </div>

      {/* =============================== */}
      {/*       BLOCOS DE INDIRETOS       */}
      {/* =============================== */}

      <div className="mb-8">
        <h3 className="font-semibold text-relevo-text/80 font-heading mb-3">
          Custos Indiretos (percentuais sobre o subtotal geral)
        </h3>

        <div className="space-y-2">
          <Linha label="Encargos Pessoais" valor={totais.encargosPessoal} />
          <Linha label="Fundo de Giro" valor={totais.fundoGiro} />
          <Linha label="Lucro (Margem)" valor={totais.lucro} />
          <Linha label="Despesas Fiscais" valor={totais.despesasFiscais} />
          <Linha label="Comissão de Captação" valor={totais.comissaoCaptacao} />

          <LinhaTotal
            label="Subtotal de Custos Indiretos"
            valor={subtotalIndiretos}
            highlight
          />
        </div>
      </div>

      {/* =============================== */}
      {/*            IMPOSTOS             */}
      {/* =============================== */}

      <div className="mb-8">
        <h3 className="font-semibold text-relevo-text/80 font-heading mb-3">Impostos</h3>
        <LinhaTotal label="Impostos calculados sobre (Diretos + Indiretos)" valor={totais.impostos} />
      </div>

      {/* =============================== */}
      {/*   TOTAL ANTES DO DESCONTO       */}
      {/* =============================== */}

      <div className="mb-8">
        <h3 className="font-semibold text-relevo-text/80 font-heading mb-3">
          Total Antes do Desconto
        </h3>

        <LinhaTotal label="Valor Base" valor={totais.totalAntesDesconto} />
        <Linha label="Desconto Aplicado" valor={totais.desconto} />

        <LinhaTotal
          label="Total Final do Orçamento"
          valor={totais.totalGeral}
          highlightStrong
        />
      </div>

      {/* =============================== */}
      {/*           MARGENS (%)           */}
      {/* =============================== */}

      <div className="mt-8 p-4 bg-relevo-light-gray rounded-lg">
        <h3 className="font-semibold text-relevo-blue font-heading mb-2">Análise Percentual</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <BlocoPercentual label="Margem de Lucro" valor={pct(totais.lucro)} />
          <BlocoPercentual label="Impostos" valor={pct(totais.impostos)} />
          <BlocoPercentual label="Custos Diretos" valor={pct(totais.subtotalGeral)} />
          <BlocoPercentual
            label="Custos Indiretos"
            valor={pct(subtotalIndiretos)}
          />
        </div>
      </div>
    </div>
  );
};

/* COMPONENTES DE UI REUTILIZÁVEIS */

const Linha = ({ label, valor }) => (
  <div className="flex justify-between border-b pb-2">
    <span className="text-relevo-text/70 font-sans">{label}:</span>
    <span className="font-medium">R$ {formatarValorBR(valor)}</span>
  </div>
);

const LinhaTotal = ({ label, valor, highlight, highlightStrong }) => (
  <div
    className={`flex justify-between pb-3 border-b-2 ${
      highlightStrong
        ? 'border-relevo-green text-lg font-bold'
        : highlight
        ? 'border-gray-300 font-semibold'
        : 'border-gray-200'
    }`}
  >
    <span className="text-relevo-text font-heading">{label}</span>
    <span className={highlightStrong ? 'text-relevo-green' : 'text-relevo-blue'}>
      R$ {formatarValorBR(valor)}
    </span>
  </div>
);

const BlocoPercentual = ({ label, valor }) => (
  <div className="text-center">
    <div className="text-relevo-blue font-sans font-semibold">{valor}%</div>
    <div className="text-relevo-blue/80 font-sans text-xs">{label}</div>
  </div>
);

export default ResumoTotal;
