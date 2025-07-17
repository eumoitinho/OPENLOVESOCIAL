# Template: Nova Feature

## Contexto Necessário
- [ ] **Módulo afetado**: {module_name}
- [ ] **Dependências existentes**: {dependencies}
- [ ] **Padrões do módulo**: {patterns}
- [ ] **Tabelas do banco**: {database_tables}
- [ ] **Componentes relacionados**: {related_components}

## Análise Prévia
1. **Objetivo da feature**: {clear_description}
2. **Usuários afetados**: {user_types}
3. **Impacto em outros módulos**: {impact_analysis}

## Checklist de Implementação

### 1. Preparação
- [ ] Ler `.context` do módulo afetado
- [ ] Verificar convenções em `/docs/context/conventions.md`
- [ ] Analisar padrões similares existentes
- [ ] Identificar componentes reutilizáveis

### 2. Desenvolvimento
- [ ] Criar/atualizar tipos TypeScript
- [ ] Implementar componentes (Server Components por padrão)
- [ ] Adicionar validações necessárias
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states

### 3. Banco de Dados
- [ ] Criar/alterar tabelas necessárias
- [ ] Implementar RLS policies
- [ ] Adicionar índices para queries frequentes
- [ ] Testar migrations

### 4. Integração
- [ ] Conectar com sistema de notificações (se aplicável)
- [ ] Atualizar cache/estado global
- [ ] Adicionar logs apropriados
- [ ] Implementar analytics events

### 5. UI/UX
- [ ] Seguir design system existente
- [ ] Garantir responsividade
- [ ] Adicionar animações/transições suaves
- [ ] Implementar feedback visual

### 6. Performance
- [ ] Implementar lazy loading quando apropriado
- [ ] Otimizar queries do banco
- [ ] Adicionar cache onde necessário
- [ ] Testar com dados volumosos

### 7. Segurança
- [ ] Validar inputs no servidor
- [ ] Implementar rate limiting
- [ ] Verificar permissões de acesso
- [ ] Sanitizar conteúdo user-generated

### 8. Testes
- [ ] Escrever testes unitários
- [ ] Adicionar testes de integração
- [ ] Testar casos extremos
- [ ] Verificar em diferentes dispositivos

### 9. Documentação
- [ ] Atualizar documentação do módulo
- [ ] Adicionar comentários em código complexo
- [ ] Atualizar README se necessário
- [ ] Documentar novas APIs

### 10. Deploy
- [ ] Verificar variáveis de ambiente
- [ ] Testar em staging
- [ ] Preparar rollback plan
- [ ] Monitorar após deploy

## Exemplo de Uso

```typescript
// Ao pedir para IA implementar uma nova feature de "reactions em posts":

"Implementar sistema de reactions em posts seguindo o template new-feature.md:
- Módulo: posts
- Permitir reactions: like, love, haha, wow, sad
- Apenas usuários autenticados
- Limite de 1 reaction por usuário por post
- Atualizar contador em tempo real
- Notificar autor do post"
```

## Notas Importantes
- Sempre preferir Server Components
- Usar Supabase Realtime para atualizações em tempo real
- Seguir padrões de código existentes
- Pensar em escalabilidade desde o início