import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const steps = [
  { path: '/', label: 'Datos Empresa', icon: '📊' },
  { path: '/benchmark', label: 'Benchmark', icon: '📈' },
  { path: '/simulacion', label: 'Simulación', icon: '🎯' },
  { path: '/informe', label: 'Informe', icon: '📄' }
];

export default function Sidebar() {
  const { datosEmpresa, reset } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">Fooday</h1>
        <span className="logo-subtitle">Benchmark</span>
      </div>
      
      <nav className="sidebar-nav">
        {steps.map((step, index) => (
          <NavLink
            key={step.path}
            to={step.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={step.path === '/'}
          >
            <span className="nav-icon">{step.icon}</span>
            <span className="nav-label">{step.label}</span>
            {index > 0 && !datosEmpresa && (
              <span className="nav-badge disabled">🔒</span>
            )}
          </NavLink>
        ))}
      </nav>

      {datosEmpresa && (
        <div className="sidebar-footer">
          <div className="company-info">
            <span className="company-name">{datosEmpresa.nombre || 'Empresa'}</span>
            <span className="company-year">{datosEmpresa.ano}</span>
          </div>
          <button onClick={reset} className="btn-reset">
            Nuevo Análisis
          </button>
        </div>
      )}
    </aside>
  );
}
