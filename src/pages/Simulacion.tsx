import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calcularSimulacion, formatearMoneda, formatearPorcentaje } from '../utils/calculos';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const presetScenarios = [
  { name: 'Conservador', variacionVentas: 2, variacionConsumos: 0, variacionPersonal: 1, variacionOtrosGastos: 0 },
  { name: 'Objetivo', variacionVentas: 5, variacionConsumos: -2, variacionPersonal: 0, variacionOtrosGastos: -1 },
  { name: 'Ambicioso', variacionVentas: 10, variacionConsumos: -5, variacionPersonal: -2, variacionOtrosGastos: -3 }
];

export default function Simulacion() {
  const navigate = useNavigate();
  const { datosEmpresa } = useApp();

  const [escenario, setEscenario] = useState({
    variacionVentas: 0,
    variacionConsumos: 0,
    variacionPersonal: 0,
    variacionOtrosGastos: 0
  });

  const simulacion = useMemo(() => {
    if (!datosEmpresa) return null;
    return calcularSimulacion(datosEmpresa, escenario);
  }, [datosEmpresa, escenario]);

  const applyPreset = (preset: typeof presetScenarios[0]) => {
    setEscenario({
      variacionVentas: preset.variacionVentas,
      variacionConsumos: preset.variacionConsumos,
      variacionPersonal: preset.variacionPersonal,
      variacionOtrosGastos: preset.variacionOtrosGastos
    });
  };

  const chartData = useMemo(() => ({
    labels: ['EBIT', 'Margen Neto (%)', 'Beneficio/Empleado (k€)'],
    datasets: [
      {
        label: 'Actual',
        data: [
          simulacion?.base.ebit || 0,
          simulacion?.base.margenNeto || 0,
          (simulacion?.base.beneficioPorEmpleado || 0) / 1000
        ],
        backgroundColor: '#94A3B8'
      },
      {
        label: 'Simulado',
        data: [
          simulacion?.escenario.ebit || 0,
          simulacion?.escenario.margenNeto || 0,
          (simulacion?.escenario.beneficioPorEmpleado || 0) / 1000
        ],
        backgroundColor: '#3B82F6'
      }
    ]
  }), [simulacion]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  if (!datosEmpresa || !simulacion) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>No hay datos</h2>
          <p>Primero ingresa los datos de tu empresa</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Ir a Datos Empresa
          </button>
        </div>
      </div>
    );
  }

  const diff = simulacion.diferencias;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Simulación de Escenarios</h2>
        <p>Proyecta el impacto de diferentes estrategias en tu negocio</p>
      </div>

      <div className="preset-buttons">
        <span className="preset-label">Escenarios predefinidos:</span>
        {presetScenarios.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="btn-preset"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="simulation-controls">
        <div className="slider-group">
          <div className="slider-header">
            <label>Variación de Ventas</label>
            <span className={`slider-value ${escenario.variacionVentas >= 0 ? 'positive' : 'negative'}`}>
              {escenario.variacionVentas >= 0 ? '+' : ''}{escenario.variacionVentas}%
            </span>
          </div>
          <input
            type="range"
            min={-20}
            max={30}
            step={1}
            value={escenario.variacionVentas}
            onChange={(e) => setEscenario({ ...escenario, variacionVentas: Number(e.target.value) })}
            className="slider"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label>Variación de Consumos (Food Cost)</label>
            <span className={`slider-value ${escenario.variacionConsumos <= 0 ? 'positive' : 'negative'}`}>
              {escenario.variacionConsumos >= 0 ? '+' : ''}{escenario.variacionConsumos}%
            </span>
          </div>
          <input
            type="range"
            min={-20}
            max={10}
            step={1}
            value={escenario.variacionConsumos}
            onChange={(e) => setEscenario({ ...escenario, variacionConsumos: Number(e.target.value) })}
            className="slider"
          />
          <span className="slider-hint">Valores negativos reducen costes</span>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label>Variación de Gastos de Personal</label>
            <span className={`slider-value ${escenario.variacionPersonal <= 0 ? 'positive' : 'negative'}`}>
              {escenario.variacionPersonal >= 0 ? '+' : ''}{escenario.variacionPersonal}%
            </span>
          </div>
          <input
            type="range"
            min={-15}
            max={15}
            step={1}
            value={escenario.variacionPersonal}
            onChange={(e) => setEscenario({ ...escenario, variacionPersonal: Number(e.target.value) })}
            className="slider"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label>Variación de Otros Gastos</label>
            <span className={`slider-value ${escenario.variacionOtrosGastos <= 0 ? 'positive' : 'negative'}`}>
              {escenario.variacionOtrosGastos >= 0 ? '+' : ''}{escenario.variacionOtrosGastos}%
            </span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={escenario.variacionOtrosGastos}
            onChange={(e) => setEscenario({ ...escenario, variacionOtrosGastos: Number(e.target.value) })}
            className="slider"
          />
        </div>
      </div>

      <div className="simulation-results">
        <div className="results-grid">
          <div className="result-card">
            <h4>Resultado EBIT</h4>
            <div className="result-values">
              <div className="result-actual">
                <span className="result-label">Actual</span>
                <span className="result-value">{formatearMoneda(simulacion.base.ebit)}</span>
              </div>
              <div className="result-arrow">→</div>
              <div className="result-sim">
                <span className="result-label">Simulado</span>
                <span className="result-value">{formatearMoneda(simulacion.escenario.ebit)}</span>
              </div>
            </div>
            <div className={`result-diff ${diff.ebit >= 0 ? 'positive' : 'negative'}`}>
              {diff.ebit >= 0 ? '+' : ''}{formatearMoneda(diff.ebit)}
            </div>
          </div>

          <div className="result-card">
            <h4>Margen Neto</h4>
            <div className="result-values">
              <div className="result-actual">
                <span className="result-label">Actual</span>
                <span className="result-value">{formatearPorcentaje(simulacion.base.margenNeto)}</span>
              </div>
              <div className="result-arrow">→</div>
              <div className="result-sim">
                <span className="result-label">Simulado</span>
                <span className="result-value">{formatearPorcentaje(simulacion.escenario.margenNeto)}</span>
              </div>
            </div>
            <div className={`result-diff ${diff.margenNeto >= 0 ? 'positive' : 'negative'}`}>
              {diff.margenNeto >= 0 ? '+' : ''}{diff.margenNeto.toFixed(2)} pp
            </div>
          </div>

          <div className="result-card">
            <h4>Beneficio por Empleado</h4>
            <div className="result-values">
              <div className="result-actual">
                <span className="result-label">Actual</span>
                <span className="result-value">{formatearMoneda(simulacion.base.beneficioPorEmpleado)}</span>
              </div>
              <div className="result-arrow">→</div>
              <div className="result-sim">
                <span className="result-label">Simulado</span>
                <span className="result-value">{formatearMoneda(simulacion.escenario.beneficioPorEmpleado)}</span>
              </div>
            </div>
            <div className={`result-diff ${diff.beneficioPorEmpleado >= 0 ? 'positive' : 'negative'}`}>
              {diff.beneficioPorEmpleado >= 0 ? '+' : ''}{formatearMoneda(diff.beneficioPorEmpleado)}
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h3>Comparativa Visual</h3>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="projection-summary">
        <h3>Proyección a 12 Meses</h3>
        <div className="projection-table">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Año Actual</th>
                <th>Año +1 (Simulado)</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ventas</td>
                <td>{formatearMoneda(datosEmpresa.ventas)}</td>
                <td>{formatearMoneda(simulacion.escenario.ventas)}</td>
                <td className={simulacion.escenario.ventas >= datosEmpresa.ventas ? 'positive' : 'negative'}>
                  {formatearMoneda(simulacion.escenario.ventas - datosEmpresa.ventas)}
                </td>
              </tr>
              <tr>
                <td>Consumos</td>
                <td>{formatearMoneda(datosEmpresa.consumos)}</td>
                <td>{formatearMoneda(simulacion.escenario.consumos)}</td>
                <td className={simulacion.escenario.consumos <= datosEmpresa.consumos ? 'positive' : 'negative'}>
                  {formatearMoneda(simulacion.escenario.consumos - datosEmpresa.consumos)}
                </td>
              </tr>
              <tr>
                <td>Personal</td>
                <td>{formatearMoneda(datosEmpresa.personal)}</td>
                <td>{formatearMoneda(simulacion.escenario.personal)}</td>
                <td className={simulacion.escenario.personal <= datosEmpresa.personal ? 'positive' : 'negative'}>
                  {formatearMoneda(simulacion.escenario.personal - datosEmpresa.personal)}
                </td>
              </tr>
              <tr>
                <td>Otros Gastos</td>
                <td>{formatearMoneda(datosEmpresa.otrosGastos)}</td>
                <td>{formatearMoneda(simulacion.escenario.otrosGastos)}</td>
                <td className={simulacion.escenario.otrosGastos <= datosEmpresa.otrosGastos ? 'positive' : 'negative'}>
                  {formatearMoneda(simulacion.escenario.otrosGastos - datosEmpresa.otrosGastos)}
                </td>
              </tr>
              <tr className="total-row">
                <td><strong>EBIT</strong></td>
                <td><strong>{formatearMoneda(simulacion.base.ebit)}</strong></td>
                <td><strong>{formatearMoneda(simulacion.escenario.ebit)}</strong></td>
                <td className={diff.ebit >= 0 ? 'positive' : 'negative'}>
                  <strong>{diff.ebit >= 0 ? '+' : ''}{formatearMoneda(diff.ebit)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-actions">
        <button onClick={() => navigate('/informe')} className="btn-primary">
          Generar Informe →
        </button>
      </div>
    </div>
  );
}
