# Plano de implementação — Migração Firebase/AI Studio para Supabase/Hostinger

## Objetivo

Substituir a infraestrutura Firebase e Google Cloud usada pelo site por Supabase e preparar o projeto Next.js para execução como aplicativo Node.js na Hostinger.

## Diagnóstico atual

- O app é Next.js 15 com React 19 e execução Node (`next start`).
- Firebase está integrado em `lib/firebase.ts`, `lib/firestore-products.ts`, `lib/AdminContext.tsx`, `components/ImageUploader.tsx` e páginas/componentes que usam autenticação.
- O login Google foi iniciado via Supabase, mas ainda depende da configuração OAuth do Google Cloud.
- Os dados atualmente têm fallback/localStorage em `lib/storage.ts`.
- Existe um schema Drizzle/Postgres em `src/db/schema.ts`, mas ele está descrito como vinculado ao Firebase e não é a camada principal usada pela interface.
- Há tabelas previstas para usuários, produtos, artigos, cupons e landing pages.
- A configuração atual não possui variáveis Supabase no `.env.example`.

## Estratégia proposta

1. **Mapear contratos atuais**
   - Catalogar todas as operações de leitura, criação, edição e exclusão em `lib/firestore-products.ts`.
   - Preservar os tipos públicos usados pelos componentes para reduzir alterações de UI.

2. **Configurar Supabase**
   - Adicionar `@supabase/supabase-js` com versão fixada no lockfile.
   - Criar cliente público usando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Usar Supabase Auth para login Google e sessão persistente.
   - Usar Supabase Storage para imagens, com bucket e políticas apropriadas.

3. **Migrar banco e segurança**
   - Converter o schema atual para SQL/migrations Supabase.
   - Criar tabelas e índices necessários.
   - Habilitar RLS em todas as tabelas expostas.
   - Definir políticas públicas para conteúdo publicado e políticas restritas para o painel administrativo.
   - Não expor `service_role`; a aplicação usará somente a chave publicável/anon no cliente.

4. **Substituir Firebase na aplicação**
   - Reescrever a camada `firestore-products` para usar Supabase Database/Auth.
   - Remover imports e inicialização Firebase.
   - Atualizar tipos de usuário e verificações de administrador.
   - Reescrever upload de imagens para Supabase Storage.
   - Manter fallback local apenas onde ele for explicitamente útil, sem permitir divergência silenciosa de dados em produção.

5. **Preparar Hostinger**
   - Atualizar `.env.example` com as variáveis necessárias.
   - Confirmar script de build/start e compatibilidade com o modo Node.js da Hostinger.
   - Documentar as variáveis e o fluxo de deploy no README.
   - Garantir que arquivos de segredo não sejam versionados.

6. **Verificação**
   - Executar lint e build.
   - Validar conexão Supabase e operações CRUD principais.
   - Testar login Google, proteção do painel, leitura pública, upload e links de imagens.
   - Revisar políticas RLS e exposição do Storage antes do deploy.

7. **Remover Firebase e Google Cloud**
   - Remover dependências e imports do Firebase.
   - Remover configurações, regras e arquivos exclusivos do Firebase.
   - Remover o login Google/OAuth e qualquer configuração Google Cloud.
   - Substituir o login por Supabase Auth com e-mail e senha ou magic link.
   - Atualizar o painel para aceitar somente os administradores configurados no Supabase.

## Informações necessárias antes da implementação

- URL do projeto Supabase.
- Chave publicável/anon do Supabase.
- Nome do bucket de imagens desejado (ou autorização para usar `images`).
- E-mail(s) que devem continuar como administradores.
- Confirmação se os dados existentes do Firebase precisam ser migrados ou se o Supabase começará vazio.
- Escolha do novo login do painel: e-mail e senha ou link mágico enviado por e-mail.

## Critérios de conclusão

- Nenhum código de produção depende de Firebase.
- O site funciona com Supabase configurado por variáveis de ambiente.
- O painel administrativo continua protegido.
- O app compila e inicia com os scripts da Hostinger.
- O README contém instruções de configuração e deploy.
