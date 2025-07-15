# 🚨 GUIA RÁPIDO - Corrigir Erro da Coluna is_public

## ❌ Problema
```
ERROR: 42703: column "is_public" does not exist
```

## 🔍 Causa
O erro ocorre porque alguns scripts estão tentando referenciar a coluna `is_public` em tabelas que não possuem essa coluna.

## ✅ Solução

### Opção 1: Executar Script Automático (Recomendado)

1. **Abra o PowerShell** no diretório do projeto
2. **Execute o script de correção:**

```powershell
.\scripts\051_execute_fix_is_public.ps1
```

### Opção 2: Executar Manualmente no Supabase

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script:** `scripts/050_fix_is_public_error.sql`

### Opção 3: Correção Manual

Se preferir corrigir manualmente, execute estes comandos no SQL Editor do Supabase:

```sql
-- 1. Adicionar coluna is_public à tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 2. Adicionar coluna is_public à tabela communities  
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 3. Adicionar coluna is_public à tabela system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 4. Adicionar coluna is_public à tabela media
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_communities_is_public ON communities(is_public);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON media(is_public);
```

## 🔧 Verificação

Após executar a correção, verifique se funcionou:

```sql
-- Verificar se as colunas foram adicionadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('events', 'communities', 'system_settings', 'media')
    AND column_name = 'is_public'
ORDER BY table_name, ordinal_position;
```

## 🚀 Próximos Passos

Após corrigir o erro da coluna `is_public`:

1. **Execute o script de correção de permissões:**
   ```powershell
   .\scripts\049_execute_fix_permissions.ps1
   ```

2. **Teste a timeline:**
   ```powershell
   .\scripts\047_test_timeline.ps1
   ```

3. **Crie posts de teste:**
   ```powershell
   .\scripts\046_create_test_posts.ps1
   ```

## 📋 Tabelas Afetadas

O script corrige as seguintes tabelas:

- ✅ **events** - Adiciona `is_public BOOLEAN DEFAULT true`
- ✅ **communities** - Adiciona `is_public BOOLEAN DEFAULT true`  
- ✅ **system_settings** - Adiciona `is_public BOOLEAN DEFAULT false`
- ✅ **media** - Adiciona `is_public BOOLEAN DEFAULT true`

## 🔒 Políticas RLS

O script também configura as políticas RLS necessárias:

- **Visualização pública** para conteúdo marcado como `is_public = true`
- **Acesso privado** para conteúdo do próprio usuário
- **Permissões de criação/edição** para o proprietário do conteúdo

## ⚠️ Importante

- **Faça backup** antes de executar os scripts
- **Teste em ambiente de desenvolvimento** primeiro
- **Verifique as permissões** após a correção
- **Monitore os logs** para identificar outros problemas

## 🆘 Suporte

Se ainda houver problemas:

1. **Verifique os logs** do Supabase
2. **Execute os scripts de teste** para identificar outros erros
3. **Consulte a documentação** completa do projeto
4. **Reporte o problema** com detalhes específicos

---

**🎉 Após corrigir este erro, o sistema estará pronto para funcionar corretamente!** 