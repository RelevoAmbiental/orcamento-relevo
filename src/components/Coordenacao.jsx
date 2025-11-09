import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';
import { validators } from '../utils/validators';

const Coordenacao = () => {
  const { orcamentoAtual, dispatch, totais } = useOrcamento();

  const handleCoordenacaoChange = (id, field, value) => {
    const isTextField = field === 'profissional' || field === 'cargo';
    const valorFinal = isTextField ? value : parseFloat(value) || 0;
    
    // Validar campos numéricos
    let erro = null;
    if (!isTextField && validators.coordenacao[field]) {
      erro = validators.coordenacao[field](valorFinal);
    }
    
    if (erro) {
      console.warn(`Erro de validação em ${field}:`, erro);
    }

    dispatch({
      type: 'UPDATE_COORDENACAO',
      payload: {
        id,
        updates: { [field]: valorFinal }
      }
    });
  };

  // Função para obter classe CSS baseada na validação
  const getInputClassName = (field, value, isTextField = false) => {
    if (isTextField) return "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
    
    const erro = validators.coordenacao[field]?.(value);
    const baseClass = "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1";
    
    return erro 
      ? `${baseClass} border-red-300 focus:ring-red-500 bg-red-50` 
      : `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-relevo-text font-heading">Coordenação</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-relevo-light-gray">
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Cargo</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Profissional</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Subtotal (R$)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Quant.</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Dias</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Horas</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Mês</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-relevo-text/80 font-sans">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {orcamentoAtual.coordenacao.map((item) => {
              const horas = item.dias * 8 * item.quant;
              const mes = item.dias / 30;
              const total = mes * item.subtotal * item.quant;
              
              // Validar campos numéricos
              const erroSubtotal = validators.coordenacao.subtotal(item.subtotal);
              const erroQuant = validators.coordenacao.quant(item.quant);
              const erroDias = validators.coordenacao.dias(item.dias);
              
              const temErro = erroSubtotal || erroQuant || erroDias;
              
              return (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-relevo-light-gray ${
                    temErro ? 'bg-red-50 hover:bg-red-100' : ''
                  }`}
                >
                  {/* CARGO (só leitura) */}
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center">
                      {item.cargo}
                      {temErro && (
                        <span className="ml-2 text-red-500 text-xs" title="Verifique os valores deste coordenador">
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* PROFISSIONAL (texto) */}
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="text"
                      value={item.profissional}
                      onChange={(e) => handleCoordenacaoChange(item.id, 'profissional', e.target.value)}
                      className={getInputClassName('profissional', item.profissional, true)}
                      placeholder="Ex: Sênior, Pleno"
                      title="Nível do profissional (Sênior, Pleno, etc.)"
                    />
                  </td>
                  
                  {/* SUBTOTAL */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.subtotal}
                        onChange={(e) => handleCoordenacaoChange(item.id, 'subtotal', e.target.value)}
                        className={getInputClassName('subtotal', item.subtotal)}
                        title={erroSubtotal || "Valor mensal do coordenador"}
                      />
                      {erroSubtotal && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroSubtotal}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* QUANTIDADE */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quant}
                        onChange={(e) => handleCoordenacaoChange(item.id, 'quant', e.target.value)}
                        className={getInputClassName('quant', item.quant)}
                        title={erroQuant || "Quantidade de coordenadores"}
                      />
                      {erroQuant && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroQuant}
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
                        onChange={(e) => handleCoordenacaoChange(item.id, 'dias', e.target.value)}
                        className={getInputClassName('dias', item.dias)}
                        title={erroDias || "Dias de trabalho"}
                      />
                      {erroDias && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroDias}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-2 text-sm text-relevo-text/70 font-sans">{horas.toFixed(1).replace('.', ',')}</td>
                  <td className="px-4 py-2 text-sm text-relevo-text/70 font-sans">{mes.toFixed(2).replace('.', ',')}</td>
                  <td className="px-4 py-2 text-sm font-semibold">R$ {formatarValorBR(total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan="7" className="px-4 py-2 text-right">Total Coordenação:</td>
              <td className="px-4 py-2 text-sm">
                R$ {formatarValorBR(totais?.subtotalCoordenacao || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
};

export default Coordenacao;