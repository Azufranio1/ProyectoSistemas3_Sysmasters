// src/utils/regresionPolinomica.ts
import regression from 'regression';

export interface DatoRegresion {
  x: number;
  y: number;
}

export interface ResultadoRegresion {
  grado: number;
  r2: number;
  predicciones: Array<{ x: number; y: number }>;
  ecuacion: string;
  coefficients: number[];
}

export class RegresionPolinomica {
  /**
   * Calcula el mejor grado polinomial (1-5) basado en R²
   */
  static calcularMejorGrado(datos: DatoRegresion[]): number {
    let mejorGrado = 1;
    let mejorR2 = 0;

    // Probar grados del 1 al 5
    for (let grado = 1; grado <= Math.min(5, datos.length - 1); grado++) {
      const resultado = this.regresion(datos, grado);
      
      // Penalizar grados altos para evitar overfitting
      const r2Ajustado = resultado.r2 - (grado - 1) * 0.02;
      
      if (r2Ajustado > mejorR2) {
        mejorR2 = r2Ajustado;
        mejorGrado = grado;
      }
    }

    return mejorGrado;
  }

  /**
   * Realiza regresión polinomial de grado específico
   */
  static regresion(datos: DatoRegresion[], grado: number): ResultadoRegresion {
    const puntos: [number, number][] = datos.map(d => [d.x, d.y]);
    
    const result = regression.polynomial(puntos, { order: grado, precision: 4 });

    return {
      grado,
      r2: result.r2,
      predicciones: result.points.map(p => ({ x: p[0], y: p[1] })),
      ecuacion: result.string,
      coefficients: result.equation
    };
  }

  /**
   * Predice valores futuros
   */
  static predecirFuturo(
    datos: DatoRegresion[], 
    grado: number, 
    mesesFuturos: number
  ): Array<{ x: number; y: number; mes: string }> {
    const puntos: [number, number][] = datos.map(d => [d.x, d.y]);
    const result = regression.polynomial(puntos, { order: grado });

    const ultimoX = datos[datos.length - 1].x;
    const predicciones: Array<{ x: number; y: number; mes: string }> = [];

    for (let i = 1; i <= mesesFuturos; i++) {
      const x = ultimoX + i;
      const y = result.predict(x)[1];
      
      // Calcular mes futuro
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() + i);
      const mes = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      predicciones.push({ x, y: Math.max(0, y), mes }); // Evitar valores negativos
    }

    return predicciones;
  }

  /**
   * Calcula métricas de confianza
   */
  static calcularMetricas(datos: DatoRegresion[], resultado: ResultadoRegresion) {
    const n = datos.length;
    const predicciones = resultado.predicciones;

    // Error cuadrático medio (MSE)
    let mse = 0;
    for (let i = 0; i < n; i++) {
      const error = datos[i].y - predicciones[i].y;
      mse += error * error;
    }
    mse /= n;

    // Raíz del error cuadrático medio (RMSE)
    const rmse = Math.sqrt(mse);

    // Error absoluto medio (MAE)
    let mae = 0;
    for (let i = 0; i < n; i++) {
      mae += Math.abs(datos[i].y - predicciones[i].y);
    }
    mae /= n;

    // Error porcentual absoluto medio (MAPE)
    let mape = 0;
    for (let i = 0; i < n; i++) {
      if (datos[i].y !== 0) {
        mape += Math.abs((datos[i].y - predicciones[i].y) / datos[i].y);
      }
    }
    mape = (mape / n) * 100;

    return {
      r2: resultado.r2,
      rmse,
      mae,
      mape,
      precision: (1 - mape / 100) * 100 // Precisión en %
    };
  }
}