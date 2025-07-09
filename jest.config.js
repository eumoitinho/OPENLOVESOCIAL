const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Caminho para sua aplicação Next.js para carregar next.config.js e arquivos .env
  dir: "./",
})

// Configuração customizada do Jest
const customJestConfig = {
  // Configurações de setup
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],

  // Ambiente de teste
  testEnvironment: "jsdom",

  // Mapeamento de módulos
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@/components/(.*)$": "<rootDir>/app/components/$1",
    "^@/lib/(.*)$": "<rootDir>/app/lib/$1",
  },

  // Padrões de arquivos de teste
  testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}", "<rootDir>/app/**/*.test.{js,jsx,ts,tsx}"],

  // Arquivos a serem ignorados
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Transformações
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // Configurações de cobertura
  collectCoverageFrom: ["app/**/*.{js,jsx,ts,tsx}", "!app/**/*.d.ts", "!app/layout.tsx", "!app/globals.css"],

  // Threshold de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Reporters de cobertura
  coverageReporters: ["text", "lcov", "html"],
}

// Exportar configuração do Jest
module.exports = createJestConfig(customJestConfig)
