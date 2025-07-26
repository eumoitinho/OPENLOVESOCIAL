# 🔧 Guia de Correção - Timeline

## 📋 Problema Identificado

A timeline não está exibindo posts de todos os usuários, apenas do usuário atual ou posts limitados.

## 🎯 Causas Possíveis

### 1. **API de Timeline Limitada**
- A API pode estar filtrando apenas posts do usuário atual
- Políticas RLS podem estar restringindo o acesso
- Query SQL pode estar limitada

### 2. **Banco de Dados Vazio**
- Não há posts no banco de dados
- Posts existem mas são privados
- Problemas na estrutura da tabela

### 3. **Componente Timeline**
- O componente pode estar fazendo filtros incorretos
- Estado local pode estar limitando os posts

## ✅ Solução Completa

### **Passo 1: Verificar e Corrigir Banco de Dados**

1. **Execute o script de teste do banco:**

```powershell
# Se você tem psql configurado
psql "postgresql://USUARIO:SENHA@HOST:PORTA/BANCO" -f "scripts/047_create_test_posts.sql"
```

2. **Ou execute via Supabase Dashboard:**
   - Vá para o SQL Editor no Supabase
   - Cole o conteúdo de `scripts/047_create_test_posts.sql`
   - Execute o script

### **Passo 2: Testar API de Timeline**

1. **Teste a API diretamente:**

```bash
# Via curl
curl -X GET "http://localhost:3000/api/timeline"

# Via PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/timeline" -Method GET
```

2. **Verifique a resposta:**
   - Deve retornar `data` com array de posts
   - Deve ter `debug` info com contadores
   - Posts devem ter `user` com dados completos

### **Passo 3: Verificar Componente Timeline**

1. **Abra o console do navegador**
2. **Acesse a timeline**
3. **Verifique os logs:**
   - Deve mostrar "🚀 [Timeline] Iniciando busca de posts..."
   - Deve mostrar "✅ [Timeline] Posts encontrados: X"
   - Deve mostrar "✅ [Timeline] Retornando X posts processados"

### **Passo 4: Corrigir Problemas Identificados**

#### **A. Se não há posts no banco:**

```sql
-- Verificar se há usuários
SELECT COUNT(*) FROM users;

-- Verificar se há posts
SELECT COUNT(*) FROM posts;

-- Criar posts de teste
INSERT INTO posts (user_id, content, visibility, created_at)
SELECT 
    id,
    'Post de teste do usuário ' || username,
    'public',
    NOW()
FROM users
LIMIT 5;
```

#### **B. Se há posts mas não aparecem:**

```sql
-- Verificar visibilidade dos posts
SELECT visibility, COUNT(*) 
FROM posts 
GROUP BY visibility;

-- Verificar posts públicos
SELECT p.*, u.username 
FROM posts p 
JOIN users u ON p.user_id = u.id 
WHERE p.visibility = 'public'
ORDER BY p.created_at DESC;
```

#### **C. Se há problemas de RLS:**

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Criar política permissiva para posts públicos
CREATE POLICY "Public posts are viewable by everyone" ON posts
    FOR SELECT USING (visibility = 'public');
```

### **Passo 5: Debugging Avançado**

#### **A. Testar API com diferentes parâmetros:**

```bash
# Testar com página específica
curl "http://localhost:3000/api/timeline?page=1&limit=10"

# Testar sem autenticação
curl "http://localhost:3000/api/timeline"
```

#### **B. Verificar logs do servidor:**

```bash
# No terminal onde o Next.js está rodando
# Deve aparecer logs como:
# 🚀 [Timeline] Iniciando busca de posts...
# ✅ [Timeline] Posts encontrados: X
# ✅ [Timeline] Autores carregados: X
# ✅ [Timeline] Retornando X posts processados
```

#### **C. Verificar estrutura da tabela:**

```sql
-- Verificar se a tabela posts tem todas as colunas necessárias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

## 🔍 Checklist de Verificação

### **✅ Banco de Dados:**
- [ ] Tabela `posts` existe
- [ ] Tabela `users` existe
- [ ] Há posts com `visibility = 'public'`
- [ ] Posts têm `user_id` válido
- [ ] Políticas RLS permitem leitura de posts públicos

### **✅ API de Timeline:**
- [ ] Endpoint `/api/timeline` responde
- [ ] Retorna posts de todos os usuários
- [ ] Inclui dados dos autores
- [ ] Inclui likes e comentários
- [ ] Logs mostram processo correto

### **✅ Componente Timeline:**
- [ ] Chama API corretamente
- [ ] Exibe posts recebidos
- [ ] Mostra dados dos autores
- [ ] Permite interações (like, comentário)
- [ ] Responsivo em diferentes telas

### **✅ Funcionalidades:**
- [ ] Posts aparecem em ordem cronológica
- [ ] Avatares dos autores são exibidos
- [ ] Nomes dos autores são exibidos
- [ ] Conteúdo dos posts é legível
- [ ] Interações funcionam

## 🚨 Problemas Comuns e Soluções

### **Problema: "Nenhum post encontrado"**

**Solução:**
1. Verificar se há posts no banco
2. Verificar se posts são públicos
3. Verificar políticas RLS
4. Criar posts de teste

### **Problema: "Erro 500 na API"**

**Solução:**
1. Verificar logs do servidor
2. Verificar conexão com Supabase
3. Verificar variáveis de ambiente
4. Verificar estrutura da tabela

### **Problema: "Posts aparecem mas sem autores"**

**Solução:**
1. Verificar se tabela `users` tem dados
2. Verificar JOIN entre posts e users
3. Verificar se `user_id` é válido
4. Verificar políticas RLS para users

### **Problema: "Timeline não atualiza"**

**Solução:**
1. Verificar se `fetchPosts()` é chamada
2. Verificar se estado é atualizado
3. Verificar se não há cache
4. Forçar reload da página

## 📊 Métricas de Sucesso

Após a correção, você deve ver:

- **Posts na timeline:** 5+ posts de diferentes usuários
- **Tempo de resposta:** < 2 segundos
- **Logs do servidor:** Processo completo sem erros
- **Console do navegador:** Sem erros JavaScript
- **Interações:** Likes e comentários funcionando

## 🎯 Próximos Passos

1. **Execute os scripts de teste**
2. **Verifique os logs do servidor**
3. **Teste a API diretamente**
4. **Verifique o componente no navegador**
5. **Reporte qualquer erro encontrado**

---

**💡 Dica:** Se ainda houver problemas, execute o script `scripts/046_test_timeline.ps1` para um diagnóstico completo do sistema. 