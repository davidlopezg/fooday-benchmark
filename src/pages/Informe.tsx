import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatearMoneda, formatearPorcentaje } from '../utils/calculos';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function Informe() {
  const navigate = useNavigate();
  const { datosEmpresa, ratios, diagnostico, comparativa } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generarPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `Informe_Benchmark_${datosEmpresa?.nombre || 'Restaurante'}_${datosEmpresa?.ano || 2024}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!datosEmpresa || !ratios || !diagnostico) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'saludable': return 'Saludable';
      case 'alerta': return 'En Alerta';
      case 'critico': return 'Crítico';
      case 'alto': return 'Alto';
      case 'normal': return 'Normal';
      case 'bajo': return 'Bajo';
      default: return status;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Informe Comparativo</h2>
        <p>Resumen ejecutivo de tu análisis financiero</p>
      </div>

      <div className="report-actions">
        <button 
          onClick={generarPDF} 
          className="btn-primary btn-download"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generando...' : '📥 Descargar Informe PDF'}
        </button>
      </div>

      <div className="report-container" ref={reportRef}>
        <div className="report-cover">
          <h1>Informe de Benchmark</h1>
          <h2>Sector Restauración CNAE 56.1</h2>
          <div className="report-meta">
            <p><strong>{datosEmpresa.nombre || 'Restaurante'}</strong></p>
            <p>Ejercicio {datosEmpresa.ano}</p>
            <p>Fecha de generación: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>1. Datos de la Empresa</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td>Cifra de Negocios</td>
                <td className="text-right">{formatearMoneda(datosEmpresa.ventas)}</td>
              </tr>
              <tr>
                <td>Consumos de Explotación</td>
                <td className="text-right">{formatearMoneda(datosEmpresa.consumos)}</td>
              </tr>
              <tr>
                <td>Gastos de Personal</td>
                <td className="text-right">{formatearMoneda(datosEmpresa.personal)}</td>
              </tr>
              <tr>
                <td>Otros Gastos</td>
                <td className="text-right">{formatearMoneda(datosEmpresa.otrosGastos)}</td>
              </tr>
              <tr>
                <td>Número de Empleados</td>
                <td className="text-right">{datosEmpresa.empleados}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h3>2. Resumen de Ratios</h3>
          <div className="report-kpis">
            <div className="report-kpi">
              <span className="kpi-label">Food Cost</span>
              <span className="kpi-value">{formatearPorcentaje(ratios.foodCost)}</span>
              <span className="kpi-status">{getStatusLabel(diagnostico.foodCost)}</span>
            </div>
            <div className="report-kpi">
              <span className="kpi-label">Margen Bruto</span>
              <span className="kpi-value">{formatearPorcentaje(ratios.margenBruto)}</span>
              <span className="kpi-status">{ratios.margenBruto >= 64 ? 'Excelente' : ratios.margenBruto >= 60 ? 'Normal' : 'Bajo'}</span>
            </div>
            <div className="report-kpi">
              <span className="kpi-label">Gasto Personal</span>
              <span className="kpi-value">{formatearPorcentaje(ratios.gastoPersonal)}</span>
              <span className="kpi-status">{getStatusLabel(diagnostico.gastoPersonal)}</span>
            </div>
            <div className="report-kpi">
              <span className="kpi-label">Liquidez</span>
              <span className="kpi-value">{ratios.liquidez.toFixed(2)}</span>
              <span className="kpi-status">{getStatusLabel(diagnostico.liquidez)}</span>
            </div>
            <div className="report-kpi">
              <span className="kpi-label">Ventas/Empleado</span>
              <span className="kpi-value">{formatearMoneda(ratios.ventasPorEmpleado)}</span>
              <span className="kpi-status">{getStatusLabel(diagnostico.productividad)}</span>
            </div>
            <div className="report-kpi">
              <span className="kpi-label">Margen Neto</span>
              <span className="kpi-value">{formatearPorcentaje(ratios.netMargin)}</span>
              <span className="kpi-status">{getStatusLabel(diagnostico.margenNeto)}</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>3. Comparativa con Benchmark</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th className="text-right">Tu Empresa</th>
                <th className="text-right">Promedio Pymes</th>
                <th className="text-right">Top 25% ROI</th>
              </tr>
            </thead>
            <tbody>
              {comparativa.map((row, i) => (
                <tr key={i}>
                  <td>{row.indicador}</td>
                  <td className="text-right">{row.empresa.toFixed(2)}</td>
                  <td className="text-right">{row.promedioPymes.toFixed(2)}</td>
                  <td className="text-right">{row.top25Roi.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {diagnostico.recomendaciones.length > 0 && (
          <div className="report-section">
            <h3>4. Recomendaciones</h3>
            {diagnostico.recomendaciones.map((rec, i) => (
              <div key={i} className="report-recommendation">
                <div className="rec-header">
                  <span className={`rec-type-badge ${rec.tipo}`}>
                    {rec.tipo.toUpperCase()}
                  </span>
                  <span className="rec-area">{rec.area}</span>
                  <span className="rec-plazo">Plazo: {rec.plazo} días</span>
                </div>
                <h4>{rec.titulo}</h4>
                <p>{rec.descripcion}</p>
                <p className="rec-impact"><strong>Impacto:</strong> {rec.impactoEstimado}</p>
              </div>
            ))}
          </div>
        )}

        <div className="report-section">
          <h3>5. Plan de Acción 90 Días</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Semana</th>
                <th>Acción</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1-2</td>
                <td>Revisión de escandallos y optimización de compras</td>
                <td>Dirección/Chef</td>
              </tr>
              <tr>
                <td>3-4</td>
                <td>Análisis de turnos y optimización de plantilla</td>
                <td>Dirección/ RRHH</td>
              </tr>
              <tr>
                <td>5-6</td>
                <td>Implementación de controles de mermas</td>
                <td>Chef/COBR</td>
              </tr>
              <tr>
                <td>7-8</td>
                <td>Revisión de contratos con proveedores</td>
                <td>Dirección</td>
              </tr>
              <tr>
                <td>9-10</td>
                <td>Análisis de eficiencia energética</td>
                <td>Mantenimiento</td>
              </tr>
              <tr>
                <td>11-12</td>
                <td>Seguimiento y ajuste de acciones</td>
                <td>Dirección</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-footer">
          <p>
            Fuente: Benchmark sectorial CNAE 56.1 - Restauración y puestos de comida, ejercicio 2024.
          </p>
          <p>
            Este informe es orientativo y no constituye asesoramiento financiero o legal.
          </p>
        </div>
      </div>

      <div className="page-actions">
        <button onClick={() => navigate('/')} className="btn-secondary">
          ← Nuevo Análisis
        </button>
      </div>
    </div>
  );
}
