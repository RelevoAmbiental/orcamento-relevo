import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';
import { validators } from '../utils/validators';

const Profissionais = () => {
  const { orcamentoAtual, dispatch, totais } = useOrcamento();

  const handleProfissionalChange = (id, field, value) => {
    const valorNumerico = parseFloat(value) || 0;
    
    // Validar o campo específico
    let erro = null;
    if (validators.profissionais[field]) {
      erro = validators.profissionais[field](valorNumerico);
    }
    
    // Se houver erro, mostrar no console (podemos adicionar UI depois)
    if (erro) {
      console.warn(`Erro de validação em ${field}:`, erro);
    }

    dispatch({
      type: 'UPDATE_PROFISSIONAIS',
      payload: {
        id,
        updates: { [field]: valorNumerico }
      }
    });
  };

  // Função para obter classe CSS baseada na validação
  const getInputClassName = (id, field, value) => {
    const erro = validators.profissionais[field]?.(value);
    const baseClass = "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1";
    
    return erro 
      ? `${baseClass} border-red-300 focus:ring-red-500 bg-red-50` 
      : `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-relevo-text font-heading">Profissionais</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#E8F5E9]">
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Cargo</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Prolabore (R$)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Pessoas</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Dias</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Horas</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Mês</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {orcamentoAtual.profissionais.map((item) => {
              const horas = item.dias * 8 * item.pessoas;
              const mes = item.dias / 30;
              const total = mes * item.prolabore * item.pessoas;
              
              // Validar cada campo para este profissional
              const erroProlabore = validators.profissionais.prolabore(item.prolabore);
              const erroPessoas = validators.profissionais.pessoas(item.pessoas);
              const erroDias = validators.profissionais.dias(item.dias);
              
              const temErro = erroProlabore || erroPessoas || erroDias;
              
              return (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    temErro ? 'bg-red-50 hover:bg-red-100' : ''
                  }`}
                >
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center">
                      {item.cargo}
                      {temErro && (
                        <span className="ml-2 text-red-500 text-xs" title="Verifique os valores deste profissional">
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* PROLABORE */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.prolabore}
                        onChange={(e) => handleProfissionalChange(item.id, 'prolabore', e.target.value)}
                        className={getInputClassName(item.id, 'prolabore', item.prolabore)}
                        title={erroProlabore || "Valor do prolabore mensal"}
                      />
                      {erroProlabore && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroProlabore}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* PESSOAS */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.pessoas}
                        onChange={(e) => handleProfissionalChange(item.id, 'pessoas', e.target.value)}
                        className={getInputClassName(item.id, 'pessoas', item.pessoas)}
                        title={erroPessoas || "Número de profissionais"}
                      />
                      {erroPessoas && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroPessoas}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* DIAS */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.dias}
                        onChange={(e) => handleProfissionalChange(item.id, 'dias', e.target.value)}
                        className={getInputClassName(item.id, 'dias', item.dias)}
                        title={erroDias || "Dias de trabalho"}
                      />
                      {erroDias && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroDias}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-2 text-sm text-gray-600">{horas.toFixed(1).replace('.', ',')}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{mes.toFixed(2).replace('.', ',')}</td>
                  <td className="px-4 py-2 text-sm font-semibold">R$ {formatarValorBR(total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#2EAD60] font-semibold font-sans">
              <td colSpan="6" className="px-4 py-2 text-right text-white">Total Profissionais:</td>
              <td className="px-4 py-2 text-sm text-white">
                 R$ {formatarValorBR(totais?.subtotalProfissionais || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
};

export default Profissionais;
