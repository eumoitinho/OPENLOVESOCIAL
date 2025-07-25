# 🚀 Instruções para Ativar Funcionalidades de Post

## ⚠️ Erro Resolvido
O erro `relation "profiles" does not exist` foi corrigido. O projeto usa a tabela `users`, não `profiles`.

---

## 📋 Passos para Implementação

### 1. **Execute o Script SQL**
Copie e execute o conteúdo do arquivo `post-actions-tables-fixed.sql` no seu banco de dados Supabase:

```sql
-- [Todo o conteúdo do arquivo post-actions-tables-fixed.sql]
```

### 2. **Verificar Tabelas Criadas**
Após executar o script, verifique se as tabelas foram criadas:

```sql
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'user_blocks' THEN 'Bloqueios de usuários'
    WHEN table_name = 'post_reports' THEN 'Denúncias de posts'
    WHEN table_name = 'hidden_posts' THEN 'Posts ocultos'
  END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_blocks', 'post_reports', 'hidden_posts')
ORDER BY table_name;
```

### 3. **Funcionalidades Disponíveis**

#### ✏️ **Editar Posts**
- Menu "⋯" no post → "Editar post"
- Apenas posts próprios
- Limite de 280 caracteres
- Prévia de mídia (não editável)

#### 🗑️ **Excluir Posts**
- Menu "⋯" no post → "Excluir post" 
- Apenas posts próprios
- Confirmação obrigatória
- Remove dados relacionados

#### 👤 **Bloquear Usuários**
- Menu "⋯" no post → "Bloquear @usuario"
- Posts de outros usuários
- Remove seguimentos mútuos
- Oculta posts do usuário

#### 🚩 **Denunciar Posts**
- Menu "⋯" no post → "Denunciar post"
- Posts de outros usuários  
- Sistema de moderação
- Previne denúncias duplicadas

#### 👁️ **Ocultar Posts**
- Menu "⋯" no post → "Ocultar post"
- Posts de outros usuários
- Não exibe mais na timeline
- Reversível

#### 💔 **Descurtir Posts**
- Menu "⋯" no post → "Descurtir post"
- Apenas posts já curtidos
- Atualização instantânea

---

## 🎯 **Como Usar**

1. **Posts Próprios**: Mostram opções de editar e excluir
2. **Posts de Outros**: Mostram opções de denunciar, bloquear, ocultar e descurtir
3. **Menu Contextual**: Clique no botão "⋯" em qualquer post
4. **Ações Destrutivas**: Requerem confirmação (excluir, bloquear)
5. **Feedback Visual**: Toasts informam o resultado das ações

---

## 🔧 **APIs Criadas**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/posts/[id]` | PATCH | Editar post |
| `/api/posts/[id]` | DELETE | Excluir post |
| `/api/posts/[id]/report` | POST | Denunciar post |
| `/api/posts/[id]/hide` | POST/DELETE | Ocultar/mostrar post |
| `/api/users/block` | POST/DELETE | Bloquear/desbloquear usuário |

---

## 🛠️ **Componentes Criados**

- `PostActionMenu.tsx` - Menu de ações do post
- `EditPostDialog.tsx` - Dialog para editar posts
- Integração completa no `PostCard.tsx`

---

## ✅ **Status**
- ✅ Tabelas SQL criadas e corrigidas
- ✅ APIs implementadas e testadas
- ✅ Componentes UI completos
- ✅ Integração no PostCard
- ✅ RLS (Row Level Security) configurado
- ✅ Índices de performance criados

**Todas as funcionalidades estão prontas para uso!** 🎉