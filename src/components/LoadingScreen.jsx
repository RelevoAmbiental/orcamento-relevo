// src/components/LoadingScreen.jsx - ARQUIVO NOVO
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-relevo-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
        <p className="text-relevo-text font-sans">Verificando acesso ao sistema...</p>
        <p className="text-relevo-text/70 text-sm mt-2 font-sans">Conectando com o Portal Relevo</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
