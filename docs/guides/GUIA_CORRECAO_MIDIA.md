# 🔧 Guia de Correção - Upload de Mídia

## 📋 Problema Identificado

O upload de imagens e vídeos não está funcionando corretamente:
- ❌ Arquivos não aparecem no preview
- ❌ URLs não são geradas
- ❌ Posts não são criados com mídia

## 🎯 Causas Identificadas

### 1. **Bucket de Storage Não Configurado**
- O bucket `media` não existe no Supabase Storage
- Políticas de acesso não estão configuradas

### 2. **Tabela Media Inexistente**
- A tabela `media` não foi criada no banco de dados
- Funções auxiliares não estão disponíveis

### 3. **Processamento de Arquivos**
- Compressão de imagens pode estar falhando
- Validação de vídeos pode estar muito restritiva

## ✅ Solução Completa

### **Passo 1: Configurar Banco de Dados**

1. **Edite o arquivo `scripts/045_execute_media_fix.ps1`** e substitua as configurações:

```powershell
# Substitua pelos seus dados do Supabase
$DB_HOST = "db.SEU_PROJETO.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "SUA_SENHA_AQUI"
```

2. **Execute o script PowerShell:**

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/045_execute_media_fix.ps1"
```

### **Passo 2: Verificar Supabase Storage**

1. **Acesse o Dashboard do Supabase**
2. **Vá para Storage > Buckets**
3. **Verifique se o bucket `media` foi criado**
4. **Se não existir, crie manualmente:**
   - Nome: `media`
   - Público: ✅ Sim
   - Tamanho máximo: 50MB
   - Tipos permitidos: `image/*, video/*`

### **Passo 3: Testar Upload**

1. **Acesse a página de criação de posts**
2. **Tente fazer upload de uma imagem pequena (menos de 1MB)**
3. **Verifique se aparece no preview**
4. **Tente criar o post**

### **Passo 4: Verificar Logs**

Se ainda houver problemas, verifique os logs:

```bash
# No terminal, execute:
npm run dev
```

E observe os logs no console do navegador e no terminal.

## 🔧 Correções Implementadas

### **1. Componente CreatePost.tsx**
- ✅ Removida compressão problemática de imagens
- ✅ Simplificado processamento de vídeos
- ✅ Adicionada seleção automática de opções
- ✅ Melhorado feedback visual

### **2. API de Posts**
- ✅ Configurado bucket `media` correto
- ✅ Melhorado tratamento de erros
- ✅ Adicionada validação de tipos de arquivo

### **3. Banco de Dados**
- ✅ Criada tabela `media`
- ✅ Configuradas políticas RLS
- ✅ Criadas funções auxiliares
- ✅ Adicionados índices de performance

## 🧪 Testes Recomendados

### **Teste 1: Upload de Imagem**
```javascript
// No console do navegador
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
const formData = new FormData()
formData.append('images', file)
formData.append('content', 'Teste de upload')
formData.append('visibility', 'public')

fetch('/api/posts', {
  method: 'POST',
  body: formData
}).then(r => r.json()).then(console.log)
```

### **Teste 2: Verificar Bucket**
```sql
-- No SQL Editor do Supabase
SELECT * FROM storage.buckets WHERE name = 'media';
```

### **Teste 3: Verificar Tabela**
```sql
-- No SQL Editor do Supabase
SELECT * FROM media LIMIT 5;
```

## 🚨 Problemas Comuns

### **Erro: "Bucket não encontrado"**
**Solução:** Execute o script SQL manualmente no Supabase SQL Editor

### **Erro: "Política RLS negada"**
**Solução:** Verifique se as políticas foram criadas corretamente

### **Erro: "Arquivo muito grande"**
**Solução:** Reduza o tamanho do arquivo ou aumente o limite no bucket

### **Erro: "Tipo de arquivo não suportado"**
**Solução:** Use apenas JPEG, PNG para imagens e MP4 para vídeos

## 📊 Monitoramento

### **Verificar Uploads**
```sql
-- Consulta para verificar uploads recentes
SELECT 
  m.id,
  m.original_name,
  m.file_type,
  m.file_size,
  m.created_at,
  u.username
FROM media m
JOIN users u ON m.user_id = u.id
ORDER BY m.created_at DESC
LIMIT 10;
```

### **Verificar Erros**
```sql
-- Consulta para verificar erros de upload
SELECT 
  COUNT(*) as total_uploads,
  COUNT(CASE WHEN file_size > 0 THEN 1 END) as successful_uploads,
  COUNT(CASE WHEN file_size = 0 THEN 1 END) as failed_uploads
FROM media
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

## 🎯 Próximos Passos

1. **Execute o script de correção**
2. **Teste o upload de uma imagem pequena**
3. **Verifique se aparece no preview**
4. **Crie um post com a imagem**
5. **Verifique se o post aparece na timeline**

## 📞 Suporte

Se ainda houver problemas:

1. **Verifique os logs do console**
2. **Teste com arquivos menores**
3. **Verifique as configurações do Supabase**
4. **Execute os testes sugeridos**

---

**✅ Com essas correções, o upload de mídia deve funcionar corretamente!** 