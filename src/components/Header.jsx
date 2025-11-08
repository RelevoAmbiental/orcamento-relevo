import React, { useState } from 'react';
import GerenciadorOrcamentos from './GerenciadorOrcamentos';
import ExportadorOrcamento from './ExportadorOrcamento';

const Header = () => {
  const [mostrarGerenciador, setMostrarGerenciador] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <img
              src="https://raw.githubusercontent.com/RelevoAmbiental/relevo-site/refs/heads/main/assets/icons/Logo_atualizada_horizontal.png"
              alt="Relevo"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Sistema de Orçamentos</h1>
              <p className="text-sm text-gray-500">Relevo Consultoria Ambiental</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarGerenciador(v => !v)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm"
            >
              {mostrarGerenciador ? 'Fechar Gerenciador' : 'Gerenciar Orçamentos'}
            </button>
            <ExportadorOrcamento />
          </div>
        </div>

        {mostrarGerenciador && (
          <div className="mt-4 border rounded-xl p-4 bg-gray-50">
            <GerenciadorOrcamentos />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
