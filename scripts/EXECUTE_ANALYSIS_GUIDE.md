# Guia para Executar Análise do Banco de Dados

## Passo 1: Criar as Funções
Primeiro, execute o arquivo `database_analysis_functions.sql` completo no SQL Query Editor do Supabase para criar todas as funções.

## Passo 2: Executar Análises (uma por vez)

### 1. Análise Geral das Tabelas
```sql
SELECT * FROM analyze_all_tables();
```
**O que faz:** Lista todas as tabelas do banco com informações de tamanho e descrição.

### 2. Estrutura da Tabela Users
```sql
SELECT * FROM analyze_users_table_structure();
```
**O que faz:** Mostra todas as colunas da tabela users, tipos de dados, constraints, etc.

### 3. Índices da Tabela Users
```sql
SELECT * FROM analyze_users_indexes();
```
**O que faz:** Lista todos os índices da tabela users com informações de performance.

### 4. Detectar Problemas
```sql
SELECT * FROM detect_users_table_issues();
```
**O que faz:** Identifica colunas, índices e constraints ausentes na tabela users.

### 5. Estatísticas da Tabela Users
```sql
SELECT * FROM analyze_users_statistics();
```
**O que faz:** Mostra estatísticas como total de usuários, verificados, premium, etc.

### 6. Relacionamentos
```sql
SELECT * FROM analyze_users_relationships();
```
**O que faz:** Mostra todas as foreign keys relacionadas à tabela users.

### 7. Políticas RLS
```sql
SELECT * FROM analyze_rls_policies();
```
**O que faz:** Lista todas as políticas de Row Level Security.

### 8. Funções Relacionadas
```sql
SELECT * FROM analyze_users_functions();
```
**O que faz:** Mostra funções que interagem com a tabela users.

### 9. Relatório Completo
```sql
SELECT * FROM generate_complete_report();
```
**O que faz:** Gera um resumo geral do estado do banco de dados.

## Passo 3: Interpretar os Resultados

### Problemas Críticos (Resolver Imediatamente):
- Colunas ausentes marcadas como "CRÍTICO"
- Índices ausentes para campos importantes
- Constraints de unicidade ausentes

### Problemas Médios (Resolver em Breve):
- Constraints de foreign key ausentes
- Políticas RLS ausentes

### Informações Úteis:
- Estatísticas de uso
- Tamanho das tabelas
- Relacionamentos existentes

## Passo 4: Enviar Resultados
Copie e cole os resultados de cada função para que eu possa analisar e criar um script de correção específico.

## Dicas:
- Execute uma função por vez
- Copie os resultados completos
- Se alguma função der erro, me informe qual foi
- Foque primeiro nas funções de detecção de problemas 