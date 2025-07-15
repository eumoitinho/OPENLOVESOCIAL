# 🎵 Guia de Atualização do Banco de Dados - Áudio e Enquetes

## 📋 Resumo das Alterações

Este guia descreve as atualizações necessárias no banco de dados para suportar posts de áudio e enquetes para assinantes.

---

## 🗄️ Scripts SQL Necessários

### **1. Script Principal: `scripts/037_posts_audio_polls.sql`**

Este script adiciona:
- ✅ Colunas para áudio na tabela `posts`
- ✅ Colunas para enquetes na tabela `posts`
- ✅ Nova tabela `poll_votes` para votos
- ✅ Funções para estatísticas e votação
- ✅ Triggers para atualização automática
- ✅ RLS policies para segurança

### **2. Script de Storage: `scripts/039_create_posts_storage.sql`**

Este script configura:
- ✅ Políticas de acesso para arquivos de áudio
- ✅ Função de limpeza de arquivos órfãos
- ✅ Trigger para deletar arquivos quando post é removido
- ✅ Estatísticas de uso de áudio

---

## 🚀 Como Executar as Atualizações

### **Opção 1: Supabase Dashboard (Recomendado)**

1. **Acesse o Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/[SEU-PROJETO]
   ```

2. **Vá para SQL Editor**
   - Clique em "SQL Editor" no menu lateral
   - Clique em "New query"

3. **Execute o script principal**
   - Copie o conteúdo de `scripts/037_posts_audio_polls.sql`
   - Cole no editor SQL
   - Clique em "Run"

4. **Execute o script de storage**
   - Copie o conteúdo de `scripts/039_create_posts_storage.sql`
   - Cole em uma nova query
   - Clique em "Run"

### **Opção 2: Via psql (Avançado)**

```bash
# Conectar ao banco
psql "postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres"

# Executar scripts
\i scripts/037_posts_audio_polls.sql
\i scripts/039_create_posts_storage.sql
```

---

## 📦 Configuração do Storage

### **1. Criar Bucket para Posts**

No Supabase Dashboard:
1. Vá para "Storage" no menu lateral
2. Clique em "New bucket"
3. Configure:
   - **Name**: `posts`
   - **Public bucket**: ✅ (para URLs públicas)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `audio/*`

### **2. Estrutura de Pastas**

```
posts/
├── [user-id]/
│   ├── audio/
│   │   ├── [timestamp]-[filename].wav
│   │   ├── [timestamp]-[filename].mp3
│   │   └── ...
│   └── ...
```

---

## 🔧 APIs Criadas

### **1. API de Áudio: `/api/posts/audio`**

**POST** - Criar post de áudio
```javascript
// Exemplo de uso
const formData = new FormData()
formData.append('content', 'Meu post de áudio')
formData.append('audio', audioFile)
formData.append('visibility', 'public')

const response = await fetch('/api/posts/audio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

**Validações:**
- ✅ Apenas assinantes (Gold/Diamante)
- ✅ Tipos: WAV, MP3, M4A, OGG
- ✅ Tamanho: 25MB (Gold) / 50MB (Diamante)
- ✅ Duração máxima: 5 minutos

### **2. API de Enquetes: `/api/posts/poll`**

**POST** - Criar enquete
```javascript
// Exemplo de uso
const response = await fetch('/api/posts/poll', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Qual sua opinião?',
    pollOptions: ['Opção 1', 'Opção 2', 'Opção 3'],
    visibility: 'public',
    durationDays: 7
  })
})
```

**PUT** - Votar em enquete
```javascript
// Exemplo de uso
const response = await fetch('/api/posts/poll', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    postId: 'post-uuid',
    optionIndex: 0
  })
})
```

**GET** - Obter estatísticas
```javascript
// Exemplo de uso
const response = await fetch('/api/posts/poll?postId=post-uuid', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🧪 Testando as Funcionalidades

### **1. Teste de Áudio**

```bash
# 1. Faça login como assinante
# 2. Acesse a timeline
# 3. Clique no ícone de microfone
# 4. Grave um áudio
# 5. Publique o post
# 6. Verifique se o áudio aparece na timeline
```

### **2. Teste de Enquete**

```bash
# 1. Faça login como assinante
# 2. Acesse a timeline
# 3. Clique no ícone de gráfico
# 4. Adicione 2-4 opções
# 5. Publique a enquete
# 6. Vote em uma opção
# 7. Verifique as estatísticas
```

### **3. Teste de APIs**

```bash
# Testar API de áudio
curl -X POST http://localhost:3000/api/posts/audio \
  -H "Authorization: Bearer [TOKEN]" \
  -F "content=Teste" \
  -F "audio=@test.wav"

# Testar API de enquetes
curl -X POST http://localhost:3000/api/posts/poll \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"content":"Teste","pollOptions":["A","B"]}'
```

---

## 🔍 Verificando a Instalação

### **1. Verificar Colunas**

```sql
-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('audio_url', 'poll_question', 'post_type');
```

### **2. Verificar Tabelas**

```sql
-- Verificar se a tabela poll_votes foi criada
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'poll_votes'
);
```

### **3. Verificar Funções**

```sql
-- Verificar se as funções foram criadas
SELECT proname FROM pg_proc 
WHERE proname IN (
    'get_poll_stats', 
    'vote_in_poll', 
    'create_audio_post', 
    'create_poll_post'
);
```

### **4. Verificar Storage**

```sql
-- Verificar se o bucket posts existe
SELECT name FROM storage.buckets WHERE name = 'posts';
```

---

## 🚨 Problemas Comuns

### **1. Erro: "Coluna não existe"**

**Solução:**
```sql
-- Executar novamente o script principal
\i scripts/037_posts_audio_polls.sql
```

### **2. Erro: "Bucket não encontrado"**

**Solução:**
- Criar bucket `posts` no Supabase Dashboard
- Configurar políticas de acesso

### **3. Erro: "Função não existe"**

**Solução:**
```sql
-- Verificar se as funções foram criadas
SELECT proname FROM pg_proc WHERE proname LIKE '%poll%';
```

### **4. Erro: "RLS policy não encontrada"**

**Solução:**
```sql
-- Verificar políticas
SELECT policyname FROM pg_policies WHERE tablename = 'posts';
```

---

## 📊 Monitoramento

### **1. Estatísticas de Uso**

```sql
-- Posts de áudio por usuário
SELECT 
    u.username,
    COUNT(p.id) as audio_posts,
    AVG(p.audio_duration) as avg_duration
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.audio_url IS NOT NULL
GROUP BY u.id, u.username
ORDER BY audio_posts DESC;
```

### **2. Enquetes Mais Populares**

```sql
-- Enquetes com mais votos
SELECT 
    p.content,
    p.poll_question,
    COUNT(pv.id) as total_votes
FROM posts p
LEFT JOIN poll_votes pv ON p.id = pv.post_id
WHERE p.poll_question IS NOT NULL
GROUP BY p.id, p.content, p.poll_question
ORDER BY total_votes DESC
LIMIT 10;
```

---

## 🔄 Rollback (Se Necessário)

### **1. Remover Colunas**

```sql
-- Remover colunas de áudio e enquete
ALTER TABLE posts 
DROP COLUMN IF EXISTS audio_url,
DROP COLUMN IF EXISTS audio_duration,
DROP COLUMN IF EXISTS poll_question,
DROP COLUMN IF EXISTS poll_options,
DROP COLUMN IF EXISTS poll_votes,
DROP COLUMN IF EXISTS poll_ends_at,
DROP COLUMN IF EXISTS post_type;
```

### **2. Remover Tabela**

```sql
-- Remover tabela de votos
DROP TABLE IF EXISTS poll_votes CASCADE;
```

### **3. Remover Funções**

```sql
-- Remover funções
DROP FUNCTION IF EXISTS get_poll_stats(UUID);
DROP FUNCTION IF EXISTS vote_in_poll(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS create_audio_post(UUID, TEXT, TEXT, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS create_poll_post(UUID, TEXT, TEXT, JSONB, INTEGER, VARCHAR);
```

---

## ✅ Checklist de Verificação

- [ ] Script principal executado
- [ ] Script de storage executado
- [ ] Bucket `posts` criado
- [ ] Políticas de acesso configuradas
- [ ] APIs testadas
- [ ] Componentes atualizados
- [ ] Funcionalidades testadas
- [ ] Documentação atualizada

---

## 🎉 Conclusão

Após executar todas as etapas acima, o sistema estará pronto para suportar:

- ✅ **Posts de áudio** para assinantes
- ✅ **Enquetes** com votação em tempo real
- ✅ **Upload seguro** de arquivos
- ✅ **Estatísticas** detalhadas
- ✅ **Interface responsiva** para todas as telas

**🎵 O OpenLove agora suporta áudio e enquetes para assinantes!** 