# Plano — carregamento dos 149 itens, lentidão e remoção do Firebase

> Este arquivo é novo. O `implementation_plan.md` existente (migração Firebase → Supabase) não foi alterado.

## Diagnóstico

- A tabela `products` tem 149 linhas, todas com imagem em Base64 (62 MB no total).
- Cada carregamento da lista baixa esses 62 MB. Isso explica a lentidão e o consumo de egress (0,918 GB de 5 GB no ciclo atual, com cerca de 875 MB em 16/10).
- O loader em `lib/firestore-products.ts` já pagina (agora com tamanho adaptativo), mas são 8 ou mais requisições pesadas em sequência.
- O plano Free não tem Image Transformations, então o redimensionamento precisa ser feito na hora do upload ou na migração.

## Fase 0 — Backup (antes de qualquer alteração de dados)

1. Exportar a tabela `products` (e `articles`) para JSON no computador.
2. Confirmar que o backup abre e tem 149 registros.

## Fase 1 — Migrar as imagens para o Storage

1. Script Node local (`scripts/migrate-product-images.mjs`), usando a chave `service_role` fornecida por você só para essa execução.
2. Para cada produto: decodificar o Base64, gravar em `images/products/<id>-<n>.webp` (o bucket `images` já existe e é público), e atualizar `image_url` e `images` com a URL pública.
3. Modo `--dry-run` por padrão: mostra o que mudaria sem gravar.
4. Gravar um relatório com produtos migrados, falhas e tamanho antes/depois.
5. Só executar sem `--dry-run` depois da sua aprovação do relatório.

## Fase 2 — Carregamento e velocidade

1. Lista de produtos: selecionar só as colunas necessárias para os cards (sem imagem embutida). Depois de migrado, 149 itens cabem em uma ou duas requisições.
2. Manter o fallback atual, mas mostrar o erro no console (já feito) e não substituir a lista por dados antigos do localStorage sem aviso.
3. Imagens: `loading="lazy"` nos cards e `width`/`height` fixos para evitar salto de layout.
4. Medir antes e depois com o Lighthouse na home e em `/achadinhos`.

## Fase 3 — Remover o Firebase (somente com confirmação explícita de cada item)

Não apaguei nada e não vou apagar sem sua confirmação. Itens:

| Item | Ação proposta | Reversível? |
|---|---|---|
| Código Firebase no repo local (`lib/firebase.ts`, `firestore.rules`, `firebase.json`, `dataconnect/`, `firebase-applet-config.json`, `firebase-blueprint.json`) | Remover em um commit separado, depois que o site estiver validado no Supabase | Sim (git) |
| Repositório GitHub `tapersant-maker/achadinhos` (Firebase/AI Studio) | Arquivar, não apagar | Sim (arquivar) |
| Repositório GitHub `tapersant-maker/achadinhos` apagado de vez | Só com seu OK por escrito | Não |
| Projeto Firebase / Firestore | Você apaga no console do Firebase (eu não tenho acesso) | Não |
| Dados do Firestore | Exportar antes de apagar, se houver algo que ainda não está no Supabase | — |

## Ordem de execução

1. Você aprova este plano.
2. Fase 0 (backup) — você confirma que o backup foi salvo.
3. Fase 1 em modo `--dry-run`, relatório enviado para você.
4. Você aprova o relatório; executo a migração real.
5. Fase 2 e medição.
6. Você valida o site.
7. Fase 3, item por item, com sua confirmação.

## O que eu preciso de você

- Aprovação deste plano.
- A chave `service_role` do Supabase, ou a execução do script localmente.
- Confirmação do nome exato do projeto Firebase a ser removido, se for apagar algo além do código.
