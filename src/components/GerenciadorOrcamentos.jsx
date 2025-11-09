// src/components/GerenciadorOrcamentos.jsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { useOrcamento } from '../context/OrcamentoContext'; // ← CORRETO: importar useOrcamento
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

  const carregarLista = async () => {
    try {
      const lista = await listarOrcamentos();
      setOrcamentos(lista);
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
      // Fechar modal após carregar
      setMostrarGerenciador(false); // ← ADICIONE ESTA LINHA
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
    }
  };

  const handleExcluir = async (id, nome) => {
    if (confirm(`Tem certeza que deseja excluir o orçamento "${nome}"?`)) {
      try {
        await excluirOrcamento(id);
        await carregarLista(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const calcularTotal = (orcamento) => {
    // Cálculo correto replicando a lógica do contexto
    const subtotalCoordenacao = orcamento.coordenacao?.reduce((total, item) => {
      const meses = item.dias / 30;
      return total + (meses * item.subtotal * item.quant);
    }, 0) || 0;
  
    const subtotalProfissionais = orcamento.profissionais?.reduce((total, item) => {
      const meses = item.dias / 30;
      return total + (meses * item.prolabore * item.pessoas);
    }, 0) || 0;
  
    const subtotalValoresUnicos = orcamento.valoresUnicos?.reduce((total, item) => {
      return total + (item.valor * item.pessoas * item.dias);
    }, 0) || 0;
  
    const subtotalLogistica = orcamento.logistica?.reduce((total, item) => {
      return total + (item.valor * item.qtd * item.dias);
    }, 0) || 0;
  
    const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;
  
    const baseFolhaPagamento = subtotalCoordenacao + subtotalProfissionais;
    const encargosPessoal = baseFolhaPagamento * (orcamento.parametros?.encargosPessoal || 0);
  
    const custoTotal = subtotalGeral + encargosPessoal;
  
    const lucro = custoTotal * (orcamento.parametros?.lucro || 0);
    const fundoGiro = custoTotal * (orcamento.parametros?.fundoGiro || 0);
  
    const subtotalComLucroFundo = custoTotal + lucro + fundoGiro;
  
    const impostos = subtotalComLucroFundo * (orcamento.parametros?.imposto || 0);
  
    const despesasFiscais = custoTotal * (orcamento.parametros?.despesasFiscais || 0);
    const comissaoCaptacao = custoTotal * (orcamento.parametros?.comissaoCaptacao || 0);
  
    const totalAntesDesconto = subtotalComLucroFundo + impostos + despesasFiscais + comissaoCaptacao;
  
    const desconto = totalAntesDesconto * ((orcamento.metadata?.desconto || 0) / 100);
    const totalGeral = totalAntesDesconto - desconto;
  
    return totalGeral;
  };
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
        <button
          onClick={carregarLista}
          className="bg-relevo-green text-white px-4 py-2 rounded-lg hover:bg-relevo-green-light transition font-sans"
        >
          Atualizar Lista
        </button>
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
            {orcamentos.map((orcamento) => (
              <tr key={orcamento.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{orcamento.metadata?.nome || 'Sem nome'}</td>
                <td className="py-3 px-4">{orcamento.metadata?.cliente || 'Não informado'}</td>
                <td className="py-3 px-4">
                  {orcamento.metadata?.data ? 
                    new Date(orcamento.metadata.data + 'T00:00:00').toLocaleDateString('pt-BR') 
                    : 'Não informada'
                  }
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  R$ {formatarValorBR(calcularTotal(orcamento))}
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
            ))}
          </tbody>
        </table>

        {orcamentos.length === 0 && (
          <div className="text-center py-8 text-relevo-text/60 font-sans">
            Nenhum orçamento salvo encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciadorOrcamentos;
