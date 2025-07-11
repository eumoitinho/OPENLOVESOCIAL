declare global {
  interface Window {
    MercadoPago: any;
  }
}

// Códigos dos planos do Mercado Pago
export type PlanoType = "gold" | "diamante" | "diamante_anual";

export const PLANOS_CODIGOS = {
  gold: "OPENGOLD",
  diamante: "OPENDIMA", 
  diamante_anual: "OPENDIMAYEAR"
} as const;

export const PLANOS_PRECOS = {
  gold: 25.0,
  diamante: 45.9,
  diamante_anual: 459.0
} as const;

export const PLANOS_FREQUENCIAS = {
  gold: 1,
  diamante: 1,
  diamante_anual: 12
} as const;

export {}; 