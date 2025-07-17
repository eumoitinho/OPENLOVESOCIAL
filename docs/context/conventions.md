# Convenções de Código - OpenLove

## TypeScript

### Tipos e Interfaces
```typescript
// ✅ Bom: Types para unions, Interfaces para objetos
type Status = 'active' | 'inactive' | 'pending';

interface User {
  id: string;
  name: string;
  status: Status;
}

// ❌ Evitar: any, tipos muito genéricos
const data: any = fetchData(); // Evitar
```

### Imports
```typescript
// Ordem: React → Next → Libs externas → Aliases → Relativos
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { formatDate } from './utils';
```

## React/Next.js

### Componentes
```typescript
// ✅ Bom: Componente funcional com tipos explícitos
interface PostCardProps {
  title: string;
  content: string;
  author: User;
}

export function PostCard({ title, content, author }: PostCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2">{content}</p>
      <span className="text-sm text-gray-500">por {author.name}</span>
    </article>
  );
}
```

### Hooks Customizados
```typescript
// Nome sempre com 'use' prefix
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // lógica
  }, []);
  
  return { user };
}
```

### Server Components vs Client Components
```typescript
// Server Component (padrão)
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetchPosts(); // OK em server component
  return <PostList posts={posts} />;
}

// Client Component (quando necessário)
// app/posts/components/post-form.tsx
'use client';

export function PostForm() {
  const [text, setText] = useState(''); // Precisa de 'use client'
  // ...
}
```

## Estilização (Tailwind CSS)

### Classes
```typescript
// ✅ Bom: Classes organizadas e legíveis
<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">

// ✅ Melhor: Usar cn() para classes condicionais
import { cn } from '@/lib/utils';

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-blue-500 bg-blue-50",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

## Estrutura de Arquivos

### Organização de Componentes
```
app/
└── posts/
    ├── page.tsx              # Página principal
    ├── layout.tsx            # Layout do módulo
    ├── components/           # Componentes locais
    │   ├── post-card.tsx
    │   ├── post-form.tsx
    │   └── post-list.tsx
    └── utils/               # Utilidades locais
        └── format-post.ts
```

### Naming
- Arquivos: kebab-case (`user-profile.tsx`)
- Componentes: PascalCase (`UserProfile`)
- Hooks: camelCase com 'use' (`useUserProfile`)
- Utils: camelCase (`formatUserName`)

## Banco de Dados (Supabase)

### Queries
```typescript
// ✅ Bom: Queries tipadas e com tratamento de erro
const { data, error } = await supabase
  .from('posts')
  .select('*, author:users(id, name, avatar_url)')
  .eq('is_public', true)
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('Error fetching posts:', error);
  return [];
}

return data;
```

### Row Level Security (RLS)
```sql
-- Sempre usar RLS nas tabelas
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (is_public = true);
```

## Error Handling

### Try-Catch Pattern
```typescript
export async function createPost(data: PostData) {
  try {
    const result = await supabase.from('posts').insert(data);
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to create post:', error);
    return { success: false, error: error.message };
  }
}
```

## Performance

### Imagens
```typescript
// ✅ Sempre usar next/image
import Image from 'next/image';

<Image
  src={avatarUrl}
  alt={`${userName} avatar`}
  width={40}
  height={40}
  className="rounded-full"
/>
```

### Lazy Loading
```typescript
// Para componentes pesados
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
});
```

## Testes

### Naming
```typescript
// describe: o que está sendo testado
// it/test: o que deve fazer
describe('PostCard', () => {
  it('should display post title and content', () => {
    // teste
  });
  
  it('should show author name', () => {
    // teste
  });
});
```

## Git Commits

### Formato
```
tipo(escopo): descrição curta

Descrição detalhada se necessário

Fixes #123
```

### Tipos
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: tarefas gerais