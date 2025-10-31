import { User } from '../types/auth';

/**
 * Formatea un valor numérico con separadores de miles usando formato español
 * @param value - Valor numérico a formatear
 * @param user - Usuario con la moneda preferida (opcional, no se usa actualmente)
 * @returns String formateado con separadores de miles (puntos)
 */
export const formatCurrency = (value: number, user?: User | null): string => {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return "0";
  }
  return numValue.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Hook personalizado para formateo de moneda con el usuario actual
 * @returns Función formatCurrency que usa la moneda del usuario autenticado
 */
export const useCurrencyFormatter = () => {
  // Esta función se puede usar dentro de componentes que tienen acceso al contexto de auth
  // Por ahora retornamos una función que espera el user como parámetro
  return (value: number, user?: User | null) => formatCurrency(value, user);
};

/**
 * Función helper para asegurar que los montos se conviertan a números antes de usarlos
 * @param value - Valor que puede ser number o string
 * @returns Número convertido
 */
export const ensureNumber = (value: number | string): number => {
  return Number(value) || 0;
};
