declare global {
  interface Window {
    MercadoPago: any;
  }
}

// Códigos dos planos do Mercado Pago
export type PlanoType = "gold" | "diamond" | "diamond_annual";

export const PLANOS_CODIGOS = {
  gold: "OPENGOLD",
  diamond: "OPENDIMA", 
  diamond_annual: "OPENDIMAYEAR"
} as const;

export const PLANOS_PRECOS = {
  gold: 25.0,
  diamond: 45.9,
  diamond_annual: 459.0
} as const;

export const PLANOS_FREQUENCIAS = {
  gold: 1,
  diamond: 1,
  diamond_annual: 12
} as const;

export {}; 