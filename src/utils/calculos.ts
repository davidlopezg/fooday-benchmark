import type { DatosEmpresa, RatiosCalculados, BenchmarkData, Diagnostico, ComparativaBenchmark, RecomendacionItem, Escenario, Simulacion } from '../types';

export function calcularRatios(datos: DatosEmpresa): RatiosCalculados {
  const { ventas, consumos, personal, otrosGastos, activoCorriente, pasivoCorriente, empleados, ebit, resultadoNeto } = datos;
  
  const foodCost = ventas > 0 ? (consumos / ventas) * 100 : 0;
  const margenBruto = ventas > 0 ? ((ventas - consumos) / ventas) * 100 : 0;
  const gastoPersonal = ventas > 0 ? (personal / ventas) * 100 : 0;
  const otrosGastosPct = ventas > 0 ? (otrosGastos / ventas) * 100 : 0;
  const ebitMargin = ventas > 0 ? ((ebit || ventas * 0.08) / ventas) * 100 : 0;
  const netMargin = ventas > 0 ? ((resultadoNeto || ventas * 0.05) / ventas) * 100 : 0;
  const liquidez = pasivoCorriente > 0 ? activoCorriente / pasivoCorriente : 0;
  const ventasPorEmpleado = empleados > 0 ? ventas / empleados : 0;
  const beneficioPorEmpleado = empleados > 0 ? (resultadoNeto || ventas * 0.05) / empleados : 0;

  return {
    foodCost,
    margenBruto,
    gastoPersonal,
    otrosGastos: otrosGastosPct,
    ebitMargin,
    netMargin,
    liquidez,
    ventasPorEmpleado,
    beneficioPorEmpleado
  };
}

export function obtenerDiagnostico(ratios: RatiosCalculados, benchmark: BenchmarkData): Diagnostico {
  const { umbrales } = benchmark;
  
  let foodCost: 'saludable' | 'alerta' | 'critico' = 'saludable';
  if (ratios.foodCost >= umbrales.foodCost.critico) foodCost = 'critico';
  else if (ratios.foodCost >= umbrales.foodCost.alerta) foodCost = 'alerta';

  let gastoPersonal: 'saludable' | 'alerta' | 'critico' = 'saludable';
  if (ratios.gastoPersonal >= umbrales.gastoPersonal.critico) gastoPersonal = 'critico';
  else if (ratios.gastoPersonal >= umbrales.gastoPersonal.alerta) gastoPersonal = 'alerta';

  let liquidez: 'saludable' | 'alerta' | 'critico' = 'saludable';
  if (ratios.liquidez < umbrales.liquidez.critico) liquidez = 'critico';
  else if (ratios.liquidez < umbrales.liquidez.alerta) liquidez = 'alerta';

  let productividad: 'bajo' | 'normal' | 'alto' = 'normal';
  if (ratios.ventasPorEmpleado >= umbrales.ventasPorEmpleado.excelente) productividad = 'alto';
  else if (ratios.ventasPorEmpleado < umbrales.ventasPorEmpleado.objetivo) productividad = 'bajo';

  let margenNeto: 'bajo' | 'normal' | 'alto' = 'normal';
  if (ratios.netMargin >= umbrales.margenNeto.excelente) margenNeto = 'alto';
  else if (ratios.netMargin < umbrales.margenNeto.saludable) margenNeto = 'bajo';

  const recomendaciones: RecomendacionItem[] = [];

  if (foodCost === 'critico' || foodCost === 'alerta') {
    recomendaciones.push({
      area: 'foodCost',
      tipo: foodCost === 'critico' ? 'urgente' : 'medio',
      titulo: 'Optimización de Costes de Materia Prima',
      descripcion: 'El ratio de food cost está por encima del umbral saludable. Revise escandallos, mermas y política de compras.',
      impactoEstimado: foodCost === 'critico' ? 'Ahorro potencial del 3-5% en costes' : 'Ahorro potencial del 1-3% en costes',
      plazo: foodCost === 'critico' ? '30' : '60'
    });
  }

  if (gastoPersonal === 'critico' || gastoPersonal === 'alerta') {
    recomendaciones.push({
      area: 'personal',
      tipo: gastoPersonal === 'critico' ? 'urgente' : 'medio',
      titulo: 'Optimización de Costes de Personal',
      descripcion: 'El gasto de personal supera los niveles de referencia. Considere optimización de turnos y formación cruzada.',
      impactoEstimado: gastoPersonal === 'critico' ? 'Ahorro potencial del 2-4% en costes' : 'Ahorro potencial del 1-2% en costes',
      plazo: gastoPersonal === 'critico' ? '30' : '60'
    });
  }

  if (liquidez === 'critico' || liquidez === 'alerta') {
    recomendaciones.push({
      area: 'liquidez',
      tipo: liquidez === 'critico' ? 'urgente' : 'medio',
      titulo: 'Mejora de Liquidez',
      descripcion: 'El ratio de liquidez está por debajo del umbral saludable. Revise el ciclo de caja y negocie plazos con proveedores.',
      impactoEstimado: liquidez === 'critico' ? 'Mejora inmediata de la solvencia' : 'Mejora gradual de la solvencia',
      plazo: liquidez === 'critico' ? '30' : '60'
    });
  }

  if (productividad === 'bajo') {
    recomendaciones.push({
      area: 'general',
      tipo: 'mejora',
      titulo: 'Incrementar Productividad por Empleado',
      descripcion: 'Las ventas por empleado están por debajo del objetivo. Considere inversión en tecnología y formación.',
      impactoEstimado: 'Incremento potencial del 10-15% en ventas por empleado',
      plazo: '90'
    });
  }

  if (margenNeto === 'bajo') {
    recomendaciones.push({
      area: 'general',
      tipo: 'mejora',
      titulo: 'Mejora del Margen Neto',
      descripcion: 'El margen neto está por debajo del promedio del sector. Analice la estructura de costes completa.',
      impactoEstimado: 'Mejora potencial de 2-5 puntos en margen neto',
      plazo: '90'
    });
  }

  return { foodCost, gastoPersonal, liquidez, productividad, margenNeto, recomendaciones };
}

export function generarComparativa(_datos: DatosEmpresa, ratios: RatiosCalculados, benchmark: BenchmarkData): ComparativaBenchmark[] {
  const estructura = benchmark.estructuraIngresosGastos;
  const productividad = benchmark.productividad;

  return [
    {
      indicador: 'Food Cost (%)',
      empresa: ratios.foodCost,
      promedioPymes: estructura.pymes.consumosExplotacion,
      top25Roi: estructura.top25Roi.consumosExplotacion,
      gapPromedio: ratios.foodCost - estructura.pymes.consumosExplotacion,
      gapTop25: ratios.foodCost - estructura.top25Roi.consumosExplotacion
    },
    {
      indicador: 'Margen Bruto (%)',
      empresa: ratios.margenBruto,
      promedioPymes: estructura.pymes.margenBruto,
      top25Roi: estructura.top25Roi.margenBruto,
      gapPromedio: ratios.margenBruto - estructura.pymes.margenBruto,
      gapTop25: ratios.margenBruto - estructura.top25Roi.margenBruto
    },
    {
      indicador: 'Gastos de Personal (%)',
      empresa: ratios.gastoPersonal,
      promedioPymes: estructura.pymes.gastosPersonal,
      top25Roi: estructura.top25Roi.gastosPersonal,
      gapPromedio: ratios.gastoPersonal - estructura.pymes.gastosPersonal,
      gapTop25: ratios.gastoPersonal - estructura.top25Roi.gastosPersonal
    },
    {
      indicador: 'Otros Gastos (%)',
      empresa: ratios.otrosGastos,
      promedioPymes: estructura.pymes.otrosGastosExplotacion,
      top25Roi: estructura.top25Roi.otrosGastosExplotacion,
      gapPromedio: ratios.otrosGastos - estructura.pymes.otrosGastosExplotacion,
      gapTop25: ratios.otrosGastos - estructura.top25Roi.otrosGastosExplotacion
    },
    {
      indicador: 'EBIT (%)',
      empresa: ratios.ebitMargin,
      promedioPymes: estructura.pymes.baii,
      top25Roi: estructura.top25Roi.baii,
      gapPromedio: ratios.ebitMargin - estructura.pymes.baii,
      gapTop25: ratios.ebitMargin - estructura.top25Roi.baii
    },
    {
      indicador: 'Margen Neto (%)',
      empresa: ratios.netMargin,
      promedioPymes: estructura.pymes.resultadoEjercicio,
      top25Roi: estructura.top25Roi.resultadoEjercicio,
      gapPromedio: ratios.netMargin - estructura.pymes.resultadoEjercicio,
      gapTop25: ratios.netMargin - estructura.top25Roi.resultadoEjercicio
    },
    {
      indicador: 'Liquidez',
      empresa: ratios.liquidez,
      promedioPymes: benchmark.liquidez.pyme,
      top25Roi: benchmark.liquidez.top25Roi,
      gapPromedio: ratios.liquidez - benchmark.liquidez.pyme,
      gapTop25: ratios.liquidez - benchmark.liquidez.top25Roi
    },
    {
      indicador: 'Ventas/Empleado (k€)',
      empresa: ratios.ventasPorEmpleado / 1000,
      promedioPymes: productividad.pymes.ventasPorEmpleado,
      top25Roi: productividad.top25Roi.ventasPorEmpleado,
      gapPromedio: (ratios.ventasPorEmpleado / 1000) - productividad.pymes.ventasPorEmpleado,
      gapTop25: (ratios.ventasPorEmpleado / 1000) - productividad.top25Roi.ventasPorEmpleado
    },
    {
      indicador: 'Beneficio/Empleado (k€)',
      empresa: ratios.beneficioPorEmpleado / 1000,
      promedioPymes: productividad.pymes.beneficioNetoPorEmpleado,
      top25Roi: productividad.top25Roi.beneficioNetoPorEmpleado,
      gapPromedio: (ratios.beneficioPorEmpleado / 1000) - productividad.pymes.beneficioNetoPorEmpleado,
      gapTop25: (ratios.beneficioPorEmpleado / 1000) - productividad.top25Roi.beneficioNetoPorEmpleado
    }
  ];
}

export function calcularSimulacion(datos: DatosEmpresa, escenario: {
  variacionVentas: number;
  variacionConsumos: number;
  variacionPersonal: number;
  variacionOtrosGastos: number;
}): Simulacion {
  const { ventas, consumos, personal, otrosGastos, empleados } = datos;
  
  const ventasSim = ventas * (1 + escenario.variacionVentas / 100);
  const consumosSim = consumos * (1 + escenario.variacionConsumos / 100);
  const personalSim = personal * (1 + escenario.variacionPersonal / 100);
  const otrosGastosSim = otrosGastos * (1 + escenario.variacionOtrosGastos / 100);
  
  const ebitBase = ventas - consumos - personal - otrosGastos;
  const ebitSim = ventasSim - consumosSim - personalSim - otrosGastosSim;
  
  const margenNetoBase = ventas > 0 ? (ebitBase * 0.7 / ventas) * 100 : 0;
  const margenNetoSim = ventasSim > 0 ? (ebitSim * 0.7 / ventasSim) * 100 : 0;
  
  const beneficioBase = ebitBase * 0.7;
  const beneficioSim = ebitSim * 0.7;
  
  const base: Escenario = {
    nombre: 'Actual',
    ventas,
    consumos,
    personal,
    otrosGastos,
    empleados,
    ebit: ebitBase,
    margenNeto: margenNetoBase,
    beneficioPorEmpleado: empleados > 0 ? beneficioBase / empleados : 0
  };
  
  const escenarioCalc: Escenario = {
    nombre: 'Simulado',
    ventas: ventasSim,
    consumos: consumosSim,
    personal: personalSim,
    otrosGastos: otrosGastosSim,
    empleados,
    ebit: ebitSim,
    margenNeto: margenNetoSim,
    beneficioPorEmpleado: empleados > 0 ? beneficioSim / empleados : 0
  };
  
  return {
    base,
    escenario: escenarioCalc,
    diferencias: {
      ebit: ebitSim - ebitBase,
      margenNeto: margenNetoSim - margenNetoBase,
      beneficioPorEmpleado: escenarioCalc.beneficioPorEmpleado - base.beneficioPorEmpleado
    }
  };
}

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

export function formatearPorcentaje(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor / 100);
}

export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}
