export interface DatosEmpresa {
  nombre: string;
  cif: string;
  cifrax: string;
  ano: number;
  ventas: number;
  consumos: number;
  personal: number;
  otrosGastos: number;
  activoCorriente: number;
  pasivoCorriente: number;
  empleados: number;
  ebit?: number;
  resultadoNeto?: number;
}

export interface RatiosCalculados {
  foodCost: number;
  margenBruto: number;
  gastoPersonal: number;
  otrosGastos: number;
  ebitMargin: number;
  netMargin: number;
  liquidez: number;
  ventasPorEmpleado: number;
  beneficioPorEmpleado: number;
}

export interface BenchmarkData {
  version: string;
  fuente: string;
  ultimaActualizacion: string;
  estructuraIngresosGastos: {
    grandesMedianas: EstructuraFinanciera;
    pymes: EstructuraFinanciera;
    top25Roi: EstructuraFinanciera;
  };
  productividad: {
    grandesMedianas: Productividad;
    pymes: Productividad;
    top25Roi: Productividad;
  };
  liquidez: {
    grandesMedianas: number;
    pyme: number;
    top25Roi: number;
  };
  umbrales: Umbrales;
  factoresRiesgo: FactorRiesgo[];
  recomendaciones: Recomendaciones;
}

export interface EstructuraFinanciera {
  importeNetoNegocios: number;
  otrosIngresosExplotacion: number;
  consumosExplotacion: number;
  margenBruto: number;
  otrosGastosExplotacion: number;
  gastosPersonal: number;
  amortizaciones: number;
  baii: number;
  resultadoEjercicio: number;
}

export interface Productividad {
  ventasPorEmpleado: number;
  gastoPersonalPorEmpleado: number;
  beneficioNetoPorEmpleado: number;
}

export interface Umbrales {
  foodCost: { saludable: number; alerta: number; critico: number };
  gastoPersonal: { saludable: number; alerta: number; critico: number };
  liquidez: { saludable: number; alerta: number; critico: number };
  ventasPorEmpleado: { objetivo: number; excelente: number };
  margenNeto: { saludable: number; bueno: number; excelente: number };
}

export interface FactorRiesgo {
  factor: string;
  impacto: string;
  incremento: string;
  mitigacion: string;
}

export interface Recomendaciones {
  foodCost: { urgente: string[]; medio: string[] };
  personal: { urgente: string[]; medio: string[] };
  liquidez: { urgente: string[]; medio: string[] };
}

export interface ComparativaBenchmark {
  indicador: string;
  empresa: number;
  promedioPymes: number;
  top25Roi: number;
  gapPromedio: number;
  gapTop25: number;
}

export interface Diagnostico {
  foodCost: 'saludable' | 'alerta' | 'critico';
  gastoPersonal: 'saludable' | 'alerta' | 'critico';
  liquidez: 'saludable' | 'alerta' | 'critico';
  productividad: 'bajo' | 'normal' | 'alto';
  margenNeto: 'bajo' | 'normal' | 'alto';
  recomendaciones: RecomendacionItem[];
}

export interface RecomendacionItem {
  area: 'foodCost' | 'personal' | 'liquidez' | 'general';
  tipo: 'urgente' | 'medio' | 'mejora';
  titulo: string;
  descripcion: string;
  impactoEstimado: string;
  plazo: '30' | '60' | '90';
}

export interface Escenario {
  nombre: string;
  ventas: number;
  consumos: number;
  personal: number;
  otrosGastos: number;
  empleados: number;
  ebit: number;
  margenNeto: number;
  beneficioPorEmpleado: number;
}

export interface Simulacion {
  base: Escenario;
  escenario: Escenario;
  diferencias: {
    ebit: number;
    margenNeto: number;
    beneficioPorEmpleado: number;
  };
}
