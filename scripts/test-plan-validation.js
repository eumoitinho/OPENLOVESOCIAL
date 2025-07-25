#!/usr/bin/env node

/**
 * Script para testar a validação de planos
 */

const { PlanValidator, PLAN_LIMITS } = require('../lib/plans/server.ts')

async function testPlanValidation() {
  console.log('🧪 Testando validação de planos...')
  
  // Testar planos definidos
  const plans = ['free', 'gold', 'diamond', 'diamond_annual']
  
  plans.forEach(plan => {
    const limits = PLAN_LIMITS[plan]
    if (limits) {
      console.log(`✅ Plano ${plan}:`, {
        maxImages: limits.maxImages,
        maxVideoSize: limits.maxVideoSize,
        canUploadAudio: limits.canUploadAudio
      })
    } else {
      console.log(`❌ Plano ${plan}: Limites não encontrados`)
    }
  })
  
  // Testar casos edge
  const edgeCases = [null, undefined, '', 'invalid_plan', 'diamante']
  
  console.log('\n🔍 Testando casos edge:')
  edgeCases.forEach(testCase => {
    const limits = PLAN_LIMITS[testCase]
    const fallback = testCase && PLAN_LIMITS[testCase] ? testCase : 'free'
    const finalLimits = PLAN_LIMITS[fallback]
    
    console.log(`- Input: ${testCase} → Fallback: ${fallback} → MaxImages: ${finalLimits?.maxImages || 'ERROR'}`)
  })
  
  console.log('\n✅ Teste concluído!')
}

// Só executar se chamado diretamente
if (require.main === module) {
  testPlanValidation().catch(console.error)
}

module.exports = { testPlanValidation }