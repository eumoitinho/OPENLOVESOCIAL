# Padrão de Versionamento - OpenLove

## Visão Geral

O OpenLove segue o **Versionamento Semântico** (SemVer) para garantir transparência e compatibilidade entre versões.

## Formato da Versão

```
MAJOR.MINOR.PATCH-PRERELEASE.BUILD
```

### Componentes

- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Novas funcionalidades compatíveis com versões anteriores  
- **PATCH**: Correções de bugs compatíveis com versões anteriores
- **PRERELEASE**: Indicador de estágio de desenvolvimento
- **BUILD**: Número sequencial da build

### Tipos de Prerelease

- `alpha`: Versão em desenvolvimento, instável
- `beta`: Versão de teste, mais estável que alpha
- `rc`: Release candidate, quase pronto para produção

## Exemplos de Versões

| Versão | Descrição |
|--------|-----------|
| `0.1.0-alpha.1` | Primeira versão alpha |
| `0.1.0-beta.1` | Primeira versão beta |
| `0.1.0-rc.1` | Primeiro release candidate |
| `0.1.0` | Versão estável |
| `1.0.0` | Primeira versão major |

## Quando Incrementar

### MAJOR (X.0.0)
- Mudanças que quebram compatibilidade com APIs
- Remoção de funcionalidades
- Mudanças significativas na arquitetura

### MINOR (0.X.0)
- Novas funcionalidades
- Melhorias significativas
- Novos sistemas implementados

### PATCH (0.0.X)
- Correções de bugs
- Melhorias de performance
- Ajustes de segurança

### PRERELEASE
- Qualquer mudança em versões de desenvolvimento
- Testes de novas funcionalidades
- Correções em versões alpha/beta

## Roadmap de Versões

### Versão Atual: 0.2.0-alpha.1
- ✅ Sistema Open Dates implementado
- ✅ Correções críticas de bugs
- ✅ Melhorias de responsividade

### Próximas Versões

#### 0.2.0-alpha.2
- Melhorias no sistema Open Dates
- Otimizações de performance
- Correções de bugs menores

#### 0.2.0-beta.1
- Sistema Open Dates estável
- Testes de integração completos
- Documentação atualizada

#### 0.2.0
- Versão estável com Open Dates
- Todas as funcionalidades testadas
- Pronto para produção

#### 1.0.0
- Primeira versão major
- API estável
- Documentação completa
- Suporte oficial

## Processo de Release

1. **Desenvolvimento**: Versões alpha
2. **Teste**: Versões beta
3. **Validação**: Release candidates
4. **Produção**: Versões estáveis

## Arquivos de Versionamento

- `package.json`: Versão atual do projeto
- `CHANGELOG.md`: Histórico de mudanças
- `VERSION.md`: Este arquivo com padrões
- `README.md`: Informações sobre versionamento

## Comandos Úteis

```bash
# Verificar versão atual
npm version

# Incrementar patch
npm version patch

# Incrementar minor
npm version minor

# Incrementar major
npm version major

# Criar prerelease
npm version prerelease --preid=alpha
```

## Tags Git

Cada versão deve ser marcada com uma tag Git:

```bash
git tag -a v0.2.0-alpha.1 -m "Release 0.2.0-alpha.1"
git push origin v0.2.0-alpha.1
```

## Notas de Release

Cada release deve incluir:
- Resumo das mudanças
- Lista de funcionalidades adicionadas
- Lista de bugs corrigidos
- Instruções de migração (se necessário)
- Próximos passos 