import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatearMoneda, formatearPorcentaje } from '../utils/calculos';
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

export default function Benchmark() {
  const navigate = useNavigate();
  const { datosEmpresa, ratios, diagnostico, comparativa, benchmark } = useApp();

  console.log('Benchmark render:', { datosEmpresa, ratios, diagnostico, comparativa: comparativa?.length });

  const chartData = useMemo(() => ({
    labels: ['Tu Empresa', 'Promedio Pymes', 'Top 25% ROI'],
    datasets: [
      {
        label: 'Food Cost (%)',
        data: [
          ratios?.foodCost || 0,
          benchmark.estructuraIngresosGastos.pymes.consumosExplotacion,
          benchmark.estructuraIngresosGastos.top25Roi.consumosExplotacion
        ],
        backgroundColor: ['#3B82F6', '#94A3B8', '#22C55E']
      },
      {
        label: 'Margen Bruto (%)',
        data: [
          ratios?.margenBruto || 0,
          benchmark.estructuraIngresosGastos.pymes.margenBruto,
          benchmark.estructuraIngresosGastos.top25Roi.margenBruto
        ],
        backgroundColor: ['#3B82F6', '#94A3B8', '#22C55E']
      },
      {
        label: 'Gastos Personal (%)',
        data: [
          ratios?.gastoPersonal || 0,
          benchmark.estructuraIngresosGastos.pymes.gastosPersonal,
          benchmark.estructuraIngresosGastos.top25Roi.gastosPersonal
        ],
        backgroundColor: ['#3B82F6', '#94A3B8', '#22C55E']
      }
    ]
  }), [ratios, benchmark]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (!datosEmpresa || !ratios || !diagnostico || !comparativa?.length) {
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'saludable':
      case 'alto':
      case 'normal':
        return 'status-success';
      case 'alerta':
      case 'medio':
        return 'status-warning';
      case 'critico':
      case 'bajo':
        return 'status-danger';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'saludable':
        return 'Saludable';
      case 'alerta':
        return 'En Alerta';
      case 'critico':
        return 'Crítico';
      case 'alto':
        return 'Alto';
      case 'normal':
        return 'Normal';
      case 'bajo':
        return 'Bajo';
      default:
        return status;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Análisis Benchmark</h2>
        <p>Comparativa de tu empresa con el sector de restauración CNAE 56.1</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Food Cost</span>
            <span className={`kpi-status ${getStatusClass(diagnostico.foodCost)}`}>
              {getStatusLabel(diagnostico.foodCost)}
            </span>
          </div>
          <div className="kpi-value">{formatearPorcentaje(ratios.foodCost)}</div>
          <div className="kpi-compare">
            Objetivo: &lt;35% | Tu meta: {formatearMoneda(datosEmpresa.ventas * 0.35)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Margen Bruto</span>
            <span className={`kpi-status ${getStatusClass(ratios.margenBruto >= 64 ? 'saludable' : ratios.margenBruto >= 60 ? 'alerta' : 'critico')}`}>
              {ratios.margenBruto >= 64 ? 'Excelente' : ratios.margenBruto >= 60 ? 'Normal' : 'Bajo'}
            </span>
          </div>
          <div className="kpi-value">{formatearPorcentaje(ratios.margenBruto)}</div>
          <div className="kpi-compare">
            Promedio: 63.9% | Top 25%: 64.4%
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Gasto Personal</span>
            <span className={`kpi-status ${getStatusClass(diagnostico.gastoPersonal)}`}>
              {getStatusLabel(diagnostico.gastoPersonal)}
            </span>
          </div>
          <div className="kpi-value">{formatearPorcentaje(ratios.gastoPersonal)}</div>
          <div className="kpi-compare">
            Promedio: 31.2% | Top 25%: 28.4%
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Liquidez</span>
            <span className={`kpi-status ${getStatusClass(diagnostico.liquidez)}`}>
              {getStatusLabel(diagnostico.liquidez)}
            </span>
          </div>
          <div className="kpi-value">{ratios.liquidez.toFixed(2)}</div>
          <div className="kpi-compare">
            Mínimo: 1.3 | Ideal: 1.5-2.0
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Ventas/Empleado</span>
            <span className={`kpi-status ${getStatusClass(diagnostico.productividad)}`}>
              {getStatusLabel(diagnostico.productividad)}
            </span>
          </div>
          <div className="kpi-value">{formatearMoneda(ratios.ventasPorEmpleado)}</div>
          <div className="kpi-compare">
            Promedio: 99k€ | Top 25%: 112k€
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Margen Neto</span>
            <span className={`kpi-status ${getStatusClass(diagnostico.margenNeto)}`}>
              {getStatusLabel(diagnostico.margenNeto)}
            </span>
          </div>
          <div className="kpi-value">{formatearPorcentaje(ratios.netMargin)}</div>
          <div className="kpi-compare">
            Promedio: 6.7% | Top 25%: 14.3%
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Comparativa Visual</h3>
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="table-section">
        <h3>Tabla Comparativa Detallada</h3>
        {comparativa && comparativa.length > 0 ? (
        <table className="benchmark-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Tu Empresa</th>
              <th>Promedio Pymes</th>
              <th>Top 25% ROI</th>
              <th>Gap vs Promedio</th>
              <th>Gap vs Top 25%</th>
            </tr>
          </thead>
          <tbody>
            {comparativa.map((row: any, index: number) => (
              <tr key={index}>
                <td>{row.indicador}</td>
                <td className="value-cell">{row.empresa.toFixed(2)}</td>
                <td>{row.promedioPymes.toFixed(2)}</td>
                <td>{row.top25Roi.toFixed(2)}</td>
                <td className={row.gapPromedio > 0 ? 'gap-positive' : row.gapPromedio < 0 ? 'gap-negative' : ''}>
                  {row.gapPromedio > 0 ? '+' : ''}{row.gapPromedio.toFixed(2)}
                </td>
                <td className={row.gapTop25 > 0 ? 'gap-positive' : row.gapTop25 < 0 ? 'gap-negative' : ''}>
                  {row.gapTop25 > 0 ? '+' : ''}{row.gapTop25.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
          <p>Cargando datos de comparativa...</p>
        )}
      </div>

      {diagnostico.recomendaciones.length > 0 && (
        <div className="recommendations-section">
          <h3>Recomendaciones Estratégicas</h3>
          <div className="recommendations-list">
            {diagnostico.recomendaciones.map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.tipo}`}>
                <div className="rec-header">
                  <span className={`rec-type ${rec.tipo}`}>
                    {rec.tipo === 'urgente' ? '🔴 Urgente' : rec.tipo === 'medio' ? '🟡 Medio' : '🟢 Mejora'}
                  </span>
                  <span className="rec-area">{rec.area}</span>
                  <span className="rec-plazo">⏱️ {rec.plazo} días</span>
                </div>
                <h4>{rec.titulo}</h4>
                <p>{rec.descripcion}</p>
                <div className="rec-impact">
                  <strong>Impacto:</strong> {rec.impactoEstimado}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="page-actions">
        <button onClick={() => navigate('/simulacion')} className="btn-primary">
          Ver Simulación →
        </button>
      </div>
    </div>
  );
}
