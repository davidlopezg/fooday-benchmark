import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { DatosEmpresa } from '../types';

export default function DataEntry() {
  const navigate = useNavigate();
  const { setDatosEmpresa, setCurrentStep, ratios } = useApp();
  
  const [formData, setFormData] = useState<DatosEmpresa>({
    nombre: '',
    cif: '',
    cifrax: '',
    ano: 2024,
    ventas: 0,
    consumos: 0,
    personal: 0,
    otrosGastos: 0,
    activoCorriente: 0,
    pasivoCorriente: 0,
    empleados: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nombre' || name === 'cif' || name === 'cifax' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ventas > 0 && formData.empleados > 0) {
      console.log('Setting datosEmpresa:', formData);
      setDatosEmpresa(formData);
      setCurrentStep(1);
      // Wait for state update before navigating
      setTimeout(() => {
        navigate('/benchmark', { replace: true });
      }, 50);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Datos de la Empresa</h2>
        <p>Ingresa los datos financieros de tu restaurante para comparar con el benchmark del sector.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-section">
          <h3>Información General</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre de la Empresa</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Restaurante Ejemplo S.L."
              />
            </div>
            <div className="form-group">
              <label htmlFor="cif">CIF/NIF</label>
              <input
                type="text"
                id="cif"
                name="cif"
                value={formData.cif}
                onChange={handleChange}
                placeholder="B12345678"
              />
            </div>
            <div className="form-group">
              <label htmlFor="ano">Año Fiscal</label>
              <input
                type="number"
                id="ano"
                name="ano"
                value={formData.ano}
                onChange={handleChange}
                min={2020}
                max={2030}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Datos Financieros (€)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ventas">Cifra de Negocios</label>
              <input
                type="number"
                id="ventas"
                name="ventas"
                value={formData.ventas || ''}
                onChange={handleChange}
                placeholder="500000"
                required
              />
              <span className="form-hint">Importe neto de facturación</span>
            </div>
            <div className="form-group">
              <label htmlFor="consumos">Consumos de Explotación</label>
              <input
                type="number"
                id="consumos"
                name="consumos"
                value={formData.consumos || ''}
                onChange={handleChange}
                placeholder="180000"
                required
              />
              <span className="form-hint">Gastos en materia prima</span>
            </div>
            <div className="form-group">
              <label htmlFor="personal">Gastos de Personal</label>
              <input
                type="number"
                id="personal"
                name="personal"
                value={formData.personal || ''}
                onChange={handleChange}
                placeholder="155000"
                required
              />
              <span className="form-hint">Nómina + seguridad social</span>
            </div>
            <div className="form-group">
              <label htmlFor="otrosGastos">Otros Gastos de Explotación</label>
              <input
                type="number"
                id="otrosGastos"
                name="otrosGastos"
                value={formData.otrosGastos || ''}
                onChange={handleChange}
                placeholder="85000"
                required
              />
              <span className="form-hint">Alquiler, suministros, mantenimiento</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Datos de Balance y Plantilla</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="activoCorriente">Activo Corriente</label>
              <input
                type="number"
                id="activoCorriente"
                name="activoCorriente"
                value={formData.activoCorriente || ''}
                onChange={handleChange}
                placeholder="45000"
                required
              />
              <span className="form-hint">Caja, bancos, clientes, existencias</span>
            </div>
            <div className="form-group">
              <label htmlFor="pasivoCorriente">Pasivo Corriente</label>
              <input
                type="number"
                id="pasivoCorriente"
                name="pasivoCorriente"
                value={formData.pasivoCorriente || ''}
                onChange={handleChange}
                placeholder="28000"
                required
              />
              <span className="form-hint">Proveedores, deudas a corto plazo</span>
            </div>
            <div className="form-group">
              <label htmlFor="empleados">Número de Empleados</label>
              <input
                type="number"
                id="empleados"
                name="empleados"
                value={formData.empleados || ''}
                onChange={handleChange}
                placeholder="5"
                required
              />
              <span className="form-hint">Plantilla media anual</span>
            </div>
          </div>
        </div>

        {ratios && (
          <div className="ratios-preview">
            <h3>Vista Previa de Ratios</h3>
            <div className="ratios-grid">
              <div className="ratio-card">
                <span className="ratio-label">Food Cost</span>
                <span className={`ratio-value ${ratios.foodCost > 36 ? 'danger' : ratios.foodCost > 35 ? 'warning' : 'success'}`}>
                  {ratios.foodCost.toFixed(1)}%
                </span>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">Margen Bruto</span>
                <span className={`ratio-value ${ratios.margenBruto < 60 ? 'danger' : ratios.margenBruto < 64 ? 'warning' : 'success'}`}>
                  {ratios.margenBruto.toFixed(1)}%
                </span>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">Gasto Personal</span>
                <span className={`ratio-value ${ratios.gastoPersonal > 33 ? 'danger' : ratios.gastoPersonal > 32 ? 'warning' : 'success'}`}>
                  {ratios.gastoPersonal.toFixed(1)}%
                </span>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">Liquidez</span>
                <span className={`ratio-value ${ratios.liquidez < 1 ? 'danger' : ratios.liquidez < 1.3 ? 'warning' : 'success'}`}>
                  {ratios.liquidez.toFixed(2)}
                </span>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">Ventas/Empleado</span>
                <span className={`ratio-value ${ratios.ventasPorEmpleado < 95000 ? 'danger' : ratios.ventasPorEmpleado < 111000 ? 'warning' : 'success'}`}>
                  {(ratios.ventasPorEmpleado / 1000).toFixed(1)}k€
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Calcular Ratios →
          </button>
        </div>
      </form>
    </div>
  );
}
