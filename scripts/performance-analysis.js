#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Análise de Performance do Projeto OpenLove\n');

// Problemas identificados
const issues = {
  memoryLeaks: [],
  performanceIssues: [],
  optimization: []
};

// 1. Vazamentos de Memória Identificados
issues.memoryLeaks.push({
  file: 'app/page.tsx',
  line: '35-67',
  issue: 'Event listeners (scroll e mousemove) com debounce usando setTimeout',
  fix: 'Os timeouts estão sendo limpos corretamente no cleanup, mas podem ser otimizados com throttle ao invés de debounce'
});

issues.memoryLeaks.push({
  file: 'app/components/media/OptimizedMediaUpload.tsx',
  line: '93',
  issue: 'setInterval pode não ser limpo se houver erro antes do clearInterval',
  fix: 'Adicionar clearInterval no bloco catch e usar useRef para garantir limpeza'
});

issues.memoryLeaks.push({
  file: 'app/components/chat/ChatInterface.tsx',
  line: '66',
  issue: 'setTimeout para typing indicator sem verificação se componente ainda está montado',
  fix: 'Usar useRef para verificar se componente está montado antes de setState'
});

issues.memoryLeaks.push({
  file: 'app/auth/signup/page.tsx',
  line: '192',
  issue: 'window.usernameTimeout global pode causar vazamento',
  fix: 'Usar useRef local ao invés de variável global window'
});

// 2. Problemas de Performance
issues.performanceIssues.push({
  file: 'app/page.tsx',
  issue: 'Animações CSS complexas com will-change em múltiplos elementos',
  fix: 'Reduzir uso de will-change e usar transform: translateZ(0) apenas quando necessário'
});

issues.performanceIssues.push({
  file: 'app/home/page.tsx',
  issue: 'Múltiplos useEffects que podem causar re-renders desnecessários',
  fix: 'Combinar useEffects relacionados e usar useMemo/useCallback para otimizar'
});

issues.performanceIssues.push({
  file: 'middleware.ts',
  issue: 'Middleware executa em todas as rotas, criando cliente Supabase a cada request',
  fix: 'Cachear cliente Supabase ou excluir mais rotas do middleware'
});

issues.performanceIssues.push({
  file: 'pnpm-lock.yaml',
  issue: 'Arquivo muito grande (436KB) pode afetar instalação de dependências',
  fix: 'Revisar e remover dependências não utilizadas'
});

// 3. Otimizações Recomendadas
issues.optimization.push({
  area: 'Bundle Size',
  issue: 'Muitas dependências com "latest" podem trazer código desnecessário',
  fix: 'Fixar versões específicas e usar dynamic imports para componentes pesados'
});

issues.optimization.push({
  area: 'Imagens',
  issue: 'Não há menção a otimização de imagens com next/image',
  fix: 'Usar next/image com lazy loading e formatos modernos (WebP/AVIF)'
});

issues.optimization.push({
  area: 'Estado Global',
  issue: 'Zustand pode estar causando re-renders desnecessários',
  fix: 'Implementar selectors específicos e usar shallow comparison'
});

// Gerar relatório
console.log('📊 RELATÓRIO DE ANÁLISE\n');

console.log('🚨 VAZAMENTOS DE MEMÓRIA IDENTIFICADOS:');
issues.memoryLeaks.forEach((leak, index) => {
  console.log(`\n${index + 1}. ${leak.file} (linha ${leak.line || 'N/A'})`);
  console.log(`   Problema: ${leak.issue}`);
  console.log(`   Solução: ${leak.fix}`);
});

console.log('\n\n⚡ PROBLEMAS DE PERFORMANCE:');
issues.performanceIssues.forEach((issue, index) => {
  console.log(`\n${index + 1}. ${issue.file}`);
  console.log(`   Problema: ${issue.issue}`);
  console.log(`   Solução: ${issue.fix}`);
});

console.log('\n\n🔧 OTIMIZAÇÕES RECOMENDADAS:');
issues.optimization.forEach((opt, index) => {
  console.log(`\n${index + 1}. ${opt.area}`);
  console.log(`   Problema: ${opt.issue}`);
  console.log(`   Solução: ${opt.fix}`);
});

// Salvar relatório em arquivo
const report = {
  timestamp: new Date().toISOString(),
  issues,
  summary: {
    memoryLeaks: issues.memoryLeaks.length,
    performanceIssues: issues.performanceIssues.length,
    optimizations: issues.optimization.length
  }
};

fs.writeFileSync(
  path.join(__dirname, '..', 'performance-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n\n✅ Relatório salvo em: performance-report.json');
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Corrigir vazamentos de memória identificados');
console.log('2. Implementar otimizações de performance');
console.log('3. Adicionar monitoramento com React DevTools Profiler');
console.log('4. Implementar lazy loading para componentes pesados');
console.log('5. Revisar e otimizar queries do Supabase');