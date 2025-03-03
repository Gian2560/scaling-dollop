export default function NotFoundPage() {
    return (
      <div className="relative flex items-center justify-center h-screen bg-black overflow-hidden">
        {/* Fondo con estrellas animadas */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111,_#000)]"></div>
          <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 animate-moveStars"></div>
        </div>
  
        {/* Contenido principal */}
        <div className="relative z-10 text-center text-white animate-fadeIn">
          <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 animate-glitch">
            404
          </h1>
          <p className="text-2xl mt-4 font-semibold text-gray-300 animate-pulse">
            Parece que te has perdido en el <span className="text-purple-400">hiperespacio</span>... 🚀
          </p>
  
          {/* Botón de regreso con efecto futurista */}
          <a
            href="/"
            className="relative inline-flex items-center justify-center px-6 py-3 mt-6 font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-xl hover:from-purple-500 hover:to-blue-500 transition-transform transform hover:scale-110 animate-neonGlow"
          >
            Volver al inicio
          </a>
        </div>
  
        {/* Nebulosa animada */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500 opacity-30 blur-3xl animate-nebula"></div>
          <div className="absolute top-2/3 right-1/3 w-[400px] h-[400px] bg-blue-500 opacity-30 blur-3xl animate-nebulaReverse"></div>
        </div>
      </div>
    );
  }
  