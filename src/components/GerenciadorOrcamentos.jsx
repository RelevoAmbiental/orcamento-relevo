// src/components/GerenciadorOrcamentos.jsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { useOrcamento } from '../context/OrcamentoContext'; // ← CORRETO: importar useOrcamento
import { formatarValorBR } from '../utils/formatters';

const GerenciadorOrcamentos = () => {
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
      // Fechar modal será feito pelo componente pai (Header)
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
    // Replica o cálculo do ResumoTotal
    const subtotalCoordenacao = orcamento.coordenacao?.reduce((acc, item) => acc + (item.total || 0), 0) || 0;
    const subtotalProfissionais = orcamento.profissionais?.reduce((acc, item) => acc + (item.total || 0), 0) || 0;
    const subtotalValoresUnicos = orcamento.valoresUnicos?.reduce((acc, item) => acc + (item.valor || 0), 0) || 0;
    const subtotalLogistica = orcamento.logistica?.reduce((acc, item) => acc + (item.valor || 0), 0) || 0;
    
    const subtotal = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;
    return subtotal;
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
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Orçamentos</h2>
        <button
          onClick={carregarLista}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
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
            <tr className="bg-gray-100">
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
                  {orcamento.metadata?.data ? new Date(orcamento.metadata.data).toLocaleDateString('pt-BR') : 'Não informada'}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  R$ {formatarValorBR(calcularTotal(orcamento))}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleCarregar(orcamento.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Carregar
                    </button>
                    <button
                      onClick={() => handleExcluir(orcamento.id, orcamento.metadata?.nome)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
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
          <div className="text-center py-8 text-gray-500">
            Nenhum orçamento salvo encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciadorOrcamentos;