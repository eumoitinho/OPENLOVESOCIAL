# Guia Rápido: Context Engineering no OpenLove

## 🚀 Início Rápido (5 minutos)

### 1. Instale as ferramentas de contexto
```bash
# Já está configurado! Use:
npm run context help
```

### 2. Explore os módulos disponíveis
```bash
npm run context list
```

### 3. Analise um módulo específico
```bash
npm run context analyze messages
```

## 📝 Como Usar com IA (Claude/Cursor)

### Para uma Nova Feature
```
"Quero adicionar reactions em posts. Use o contexto do módulo posts e siga o template new-feature.md"
```

### Para Debug/Correção
```
"O chat está com problema de reconexão. Analise usando o .context do módulo messages"
```

### Para Refatoração
```
"Refatore o sistema de notificações seguindo as convenções em docs/context/conventions.md"
```

## 🎯 Melhores Práticas

### 1. **Sempre referencie o contexto**
❌ "Crie um sistema de comentários"
✅ "Crie um sistema de comentários no módulo posts, seguindo o padrão do chat em app/messages/.context"

### 2. **Use perfis específicos no Cursor**
- Trabalhando no chat? O Cursor vai carregar automaticamente o contexto do chat
- Veja os perfis em `.cursor/context-profiles.json`

### 3. **Mantenha contextos atualizados**
Após grandes mudanças:
```bash
npm run context validate
```

## 📊 Economia de Tokens

### Sem Context Engineering
- Prompt inicial: ~2000 tokens
- Correções: ~5000 tokens
- Total: ~7000 tokens

### Com Context Engineering
- Contexto carregado: ~500 tokens
- Prompt focado: ~200 tokens
- Total: ~700 tokens
- **Economia: 90%!**

## 🔧 Comandos Úteis

```bash
# Listar módulos
npm run context list

# Analisar módulo (vê tamanho, tokens, etc)
npm run context analyze <module>

# Gerar contexto comprimido
npm run context compress <module>

# Validar todos os contextos
npm run context validate
```

## 💡 Dicas Pro

1. **Comece pequeno**: Teste com uma feature simples primeiro
2. **Use templates**: Veja `docs/ai-instructions/templates/`
3. **Contexto > Prompt**: Invista tempo organizando contexto, economize em prompts
4. **Feedback loop**: Ajuste contextos baseado no que funciona

## 🎬 Exemplo Prático

### Tarefa: Adicionar sistema de likes em posts

#### Sem Context Engineering:
```
"Adicione um sistema de likes nos posts. Use React, TypeScript, Tailwind CSS, 
Supabase para o banco de dados. Crie uma tabela de likes com user_id e post_id. 
Implemente o componente de like button que mostra o contador. Use optimistic updates.
Adicione real-time updates. Siga os padrões do projeto..."
[... mais 500 palavras de contexto ...]
```

#### Com Context Engineering:
```
"Adicione likes em posts seguindo app/content/.context e template new-feature.md"
```

A IA já tem todo o contexto necessário! 🎯

## 📚 Próximos Passos

1. Leia `docs/AI_CONTEXT_ENGINEERING.md` para entender a teoria
2. Explore os arquivos `.context` existentes
3. Crie um `.context` para seu próximo módulo
4. Compartilhe suas experiências!

---

💬 **Lembre-se**: Context Engineering não é sobre escrever prompts melhores, é sobre criar um ambiente onde a IA já sabe tudo que precisa para te ajudar efetivamente!