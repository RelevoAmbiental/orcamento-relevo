// src/components/GerenciadorOrcamentos.jsx - VERSÃO COMPLETA COM DEBUG (corrigida)
import React, { useState, useEffect, useMemo } from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';

const GerenciadorOrcamentos = ({ setMostrarGerenciador }) => {
  const { 
    listarOrcamentos, 
    carregarOrcamento, 
    excluirOrcamento,
    carregando, 
    erro 
  } = useOrcamento();
  
  const [orcamentos, setOrcamentos] = useState([]);
  const [busca, setBusca] = useState(""); // filtro simples no cliente

  const carregarLista = async () => {
    try {
      const lista = await listarOrcamentos();

      // Remover duplicados por ID
      const listaUnica = lista.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) acc.push(current);
        return acc;
      }, []);

      setOrcamentos(listaUnica);
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    }
  };

  useEffect(() => {
    carregarLista();
  }, []);

  const handleCarregar = async (id) => {
    try {
      await carregarOrcamento(id);
      setMostrarGerenciador(false);
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
    }
  };

  const handleExcluir = async (id, nome) => {
    if (confirm(`Tem certeza que deseja excluir o orçamento "${nome}"?`)) {
      try {
        await excluirOrcamento(id);
        await carregarLista();
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  // Regras de cálculo local — fallback para documentos antigos
  const calcularTotalLocal = (orcamento) => {
    const n = (v) => (isNaN(v) || v === null || v === undefined ? 0 : Number(v));

    const subtotalCoordenacao = (orcamento.coordenacao || []).reduce((total, item) => {
      const meses = n(item.dias) / 30;
      return total + (meses * n(item.subtotal) * n(item.quant));
    }, 0);

    const subtotalProfissionais = (orcamento.profissionais || []).reduce((total, item) => {
      const meses = n(item.dias) / 30;
      return total + (meses * n(item.prolabore) * n(item.pessoas));
    }, 0);

    const subtotalValoresUnicos = (orcamento.valoresUnicos || []).reduce((total, item) => {
      return total + (n(item.valor) * n(item.pessoas) * n(item.dias));
    }, 0);

    const subtotalLogistica = (orcamento.logistica || []).reduce((total, item) => {
      return total + (n(item.valor) * n(item.qtd) * n(item.dias));
    }, 0);

    const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;
    const p = orcamento.parametros || {};

    const encargosPessoal   = (subtotalCoordenacao + subtotalProfissionais) * n(p.encargosPessoal);
    const custoTotal        = subtotalGeral + encargosPessoal;
    const lucro             = custoTotal * n(p.lucro);
    const fundoGiro         = custoTotal * n(p.fundoGiro);
    const subtotalComLucroFundo = custoTotal + lucro + fundoGiro;

    const impostos          = subtotalComLucroFundo * n(p.imposto);
    const despesasFiscais   = custoTotal * n(p.despesasFiscais);
    const comissaoCaptacao  = custoTotal * n(p.comissaoCaptacao);

    const totalAntesDesconto = subtotalComLucroFundo + impostos + despesasFiscais + comissaoCaptacao;

    const descontoPercent = n(orcamento?.metadata?.desconto) / 100;
    const desconto        = totalAntesDesconto * descontoPercent;

    return totalAntesDesconto - desconto;
  };

  const getTotalExibicao = (orcamento) => {
    if (orcamento?.totais?.totalGeral !== undefined) {
      return orcamento.totais.totalGeral;
    }
    return calcularTotalLocal(orcamento);
  };

  // Filtro simples no cliente (opcional)
  const orcamentosFiltrados = useMemo(() => {
    const t = (busca || "").trim().toLowerCase();
    if (!t) return orcamentos;
    return orcamentos.filter(o => {
      const nome = (o?.metadata?.nome || "").toLowerCase();
      const cliente = (o?.metadata?.cliente || "").toLowerCase();
      return nome.includes(t) || cliente.includes(t);
    });
  }, [orcamentos, busca]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-relevo-text font-heading">Gerenciar Orçamentos</h2>
        <div className="flex gap-2">
          <input
            placeholder="Buscar por nome/cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            style={{minWidth: 240}}
          />
          <button
            onClick={carregarLista}
            className="bg-relevo-green text-white px-4 py-2 rounded-lg hover:bg-relevo-green-light transition font-sans"
          >
            Atualizar Lista
          </button>
        </div>
      </div>

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {erro}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-relevo-light-gray">
              <th className="py-3 px-4 text-left">Nome</th>
              <th className="py-3 px-4 text-left">Cliente</th>
              <th className="py-3 px-4 text-left">Data</th>
              <th className="py-3 px-4 text-right">Valor Total</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orcamentosFiltrados.map((orcamento) => {
              const valor = getTotalExibicao(orcamento);
              const dataStr = orcamento?.metadata?.data 
                ? new Date(orcamento.metadata.data + 'T00:00:00').toLocaleDateString('pt-BR')
                : (orcamento?.atualizadoEm?.toDate 
                    ? orcamento.atualizadoEm.toDate().toLocaleDateString('pt-BR')
                    : (orcamento?.atualizadoEm 
                        ? new Date(orcamento.atualizadoEm).toLocaleDateString('pt-BR')
                        : '—'));

              return (
                <tr key={orcamento.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{orcamento.metadata?.nome || 'Sem nome'}</td>
                  <td className="py-3 px-4">{orcamento.metadata?.cliente || 'Não informado'}</td>
                  <td className="py-3 px-4">{dataStr}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    R$ {formatarValorBR(valor)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleCarregar(orcamento.id)}
                        className="bg-relevo-blue text-white px-3 py-1 rounded hover:bg-relevo-blue/90 transition text-sm font-sans"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => handleExcluir(orcamento.id, orcamento.metadata?.nome)}
                        className="bg-relevo-orange text-white px-3 py-1 rounded hover:bg-relevo-orange/90 transition text-sm font-sans"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orcamentosFiltrados.length === 0 && (
          <div className="text-center py-8 text-relevo-text/60 font-sans">
            Nenhum orçamento encontrado para o filtro aplicado.
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciadorOrcamentos;
