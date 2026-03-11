import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { DatosEmpresa, RatiosCalculados, BenchmarkData, Diagnostico, ComparativaBenchmark } from '../types';
import benchmarkData from '../data/benchmark.json';
import { calcularRatios, obtenerDiagnostico, generarComparativa } from '../utils/calculos';

interface AppContextType {
  datosEmpresa: DatosEmpresa | null;
  setDatosEmpresa: (datos: DatosEmpresa | null) => void;
  ratios: RatiosCalculados | null;
  diagnostico: Diagnostico | null;
  comparativa: ComparativaBenchmark[];
  benchmark: BenchmarkData;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BENCHMARK = benchmarkData as unknown as BenchmarkData;

export function AppProvider({ children }: { children: ReactNode }) {
  const [datosEmpresa, setDatosEmpresa] = useState<DatosEmpresa | null>(null);
  const [ratios, setRatios] = useState<RatiosCalculados | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [comparativa, setComparativa] = useState<ComparativaBenchmark[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const benchmark = useMemo(() => BENCHMARK, []);

  useEffect(() => {
    const saved = localStorage.getItem('fooday-datos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDatosEmpresa(parsed);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (datosEmpresa && datosEmpresa.ventas > 0) {
      localStorage.setItem('fooday-datos', JSON.stringify(datosEmpresa));
      const ratiosCalc = calcularRatios(datosEmpresa);
      setRatios(ratiosCalc);
      const diagnosticoCalc = obtenerDiagnostico(ratiosCalc, benchmark);
      setDiagnostico(diagnosticoCalc);
      const comparativaCalc = generarComparativa(datosEmpresa, ratiosCalc, benchmark);
      setComparativa(comparativaCalc);
    }
  }, [datosEmpresa, benchmark]);

  const reset = () => {
    setDatosEmpresa(null);
    setRatios(null);
    setDiagnostico(null);
    setComparativa([]);
    setCurrentStep(0);
    localStorage.removeItem('fooday-datos');
  };

  return (
    <AppContext.Provider value={{
      datosEmpresa,
      setDatosEmpresa,
      ratios,
      diagnostico,
      comparativa,
      benchmark,
      currentStep,
      setCurrentStep,
      reset
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
