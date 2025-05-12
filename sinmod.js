const { useState, useEffect, useRef } = React;

const SinModSimulator = () => {
  // Parámetros del modelo
  const [params, setParams] = useState({
    A: 1,         // Amplitud
    phi: 0,       // Fase inicial
    omega: 1,     // Frecuencia angular
    T: 2,         // Periodo
    harmonics: 3, // Número de armónicos
  });

  // Estados para la visualización
  const [time, setTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Función para calcular el valor de SinMod en un punto x
  const calculateSinMod = (x, t) => {
    const { A, omega, phi, harmonics } = params;
    let value = 0;
    
    // Sumar los armónicos
    for (let n = 1; n <= harmonics; n++) {
      value += A * Math.sin(n * omega * x + phi * n + t) / n;
    }
    
    return value;
  };

  // Función para dibujar la curva SinMod
  const drawSinMod = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar ejes
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    
    // Dibujar la curva SinMod
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
      const scaledX = (x / width) * 2 * Math.PI * params.T;
      const y = calculateSinMod(scaledX, time);
      const scaledY = height / 2 - y * (height / 4);
      
      if (x === 0) {
        ctx.moveTo(x, scaledY);
      } else {
        ctx.lineTo(x, scaledY);
      }
    }
    
    ctx.stroke();
    
    // Dibujar marcadores que simulan las etiquetas del marcado SPAMM
    ctx.fillStyle = '#ff6600';
    for (let x = 0; x < width; x += width / 10) {
      const scaledX = (x / width) * 2 * Math.PI * params.T;
      const y = calculateSinMod(scaledX, time);
      const scaledY = height / 2 - y * (height / 4);
      
      ctx.beginPath();
      ctx.arc(x, scaledY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  // Función para animar
  const animate = () => {
    setTime(prevTime => prevTime + 0.05);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Iniciar/detener animación
  const toggleAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(animationRef.current);
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
    setIsAnimating(!isAnimating);
  };

  // Actualizar el dibujo cuando cambien los parámetros o el tiempo
  useEffect(() => {
    drawSinMod();
  }, [params, time]);

  // Limpiar animación al desmontar
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Función para manejar cambios en los controles
  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  // Formulación matemática basada en el póster
  const formula = `
  I₁(P, t) = A·cos(ωx + φ + π/2) + φ₁(P, t)
  I₂(P, t) = A·cos(ωx + φ - π/2) + φ₂(P, t)
  `;

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">Simulador Interactivo de SinMod</h2>
      <p className="text-gray-700 mb-4 text-center">Modelado sinusoidal para la evaluación del movimiento miocárdico en RM cardíaca</p>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Visualización</h3>
        <div className="border rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={300}
            className="w-full bg-gray-50"
          ></canvas>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button 
            onClick={toggleAnimation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {isAnimating ? 'Detener animación' : 'Iniciar animación'}
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Parámetros SinMod</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amplitud (A): {params.A.toFixed(2)}
            </label>
            <input
              type="range"
              name="A"
              min="0.1"
              max="2"
              step="0.1"
              value={params.A}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fase (φ): {params.phi.toFixed(2)}
            </label>
            <input
              type="range"
              name="phi"
              min="0"
              max={2 * Math.PI}
              step="0.1"
              value={params.phi}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frecuencia (ω): {params.omega.toFixed(2)}
            </label>
            <input
              type="range"
              name="omega"
              min="0.1"
              max="3"
              step="0.1"
              value={params.omega}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Periodo (T): {params.T.toFixed(2)}
            </label>
            <input
              type="range"
              name="T"
              min="0.5"
              max="5"
              step="0.5"
              value={params.T}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Armónicos: {params.harmonics}
            </label>
            <input
              type="range"
              name="harmonics"
              min="1"
              max="10"
              step="1"
              value={params.harmonics}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Formulación Matemática</h3>
        <div className="bg-gray-100 p-3 rounded font-mono text-sm overflow-auto">
          {formula}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          SinMod utiliza múltiples armónicos del modelo de transformada de Fourier para crear ondas sinusoidales 
          que captan el movimiento de las líneas de marcaje en resonancia magnética cardíaca. El desplazamiento
          se calcula a partir de la fase local de la señal analítica.
        </p>
      </div>
    </div>
  );
};

// Renderizar el componente en el DOM
ReactDOM.render(<SinModSimulator />, document.getElementById('root'));
