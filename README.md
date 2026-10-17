# Achadinhos & Looks – Tamires Santos

> Plataforma completa de curadoria e afiliação de produtos da Shopee, Shein, Mercado Livre e Amazon, desenvolvida com Next.js 15 App Router, React 19, Tailwind CSS v4 e Supabase (Postgres, Auth e Storage).

---

## 🌟 Visão Geral

O projeto **Achadinhos & Looks – Tamires Santos** é um hub de alta conversão para tráfego orgânico e pago (Google Ads, Meta Ads, TikTok), focado em curadoria de ofertas, cupons de desconto e achadinhos virais.

### Principais Funcionalidades:
- **Catálogo de Achadinhos (`/achadinhos`):** Vitrine com filtros por loja (Shopee, Shein, Mercado Livre, Amazon), ordenação inteligente, busca em tempo real e categorias setorizadas (*Suplementos, Musculação, Eletrônicos, Vestuário, Casa, etc.*).
- **Páginas de Alta Conversão / Campanhas (`/campanha/[slug]`):** Gerador de landing pages para produtos específicos (ex: Natal, Especial Suplementos, Mini Game Retrô) com contadores regressivos, depoimentos reais, prova social e botão de ação flutuante (sticky CTA).
- **Blog & Artigos (`/blog`, `/artigo/[id]`):** Sistema de artigos e reviews detalhados com suporte a Markdown, links de afiliados integrados e recomendações de produtos.
- **Central de Cupons (`/cupons`):** Cupons de frete grátis e percentuais com funcionalidade de cópia em um clique e redirecionamento seguro para as lojas parceiras.
- **Painel Administrativo (`/painel`):**
  - Autenticação com Google Sign-In restrita aos e-mails autorizados da administradora.
  - Cadastro, edição e remoção de produtos, com upload de imagens compactadas e fotos múltiplas.
  - Criação e gerenciamento de campanhas sazonais e artigos de blog.
  - Configurações globais do site (título, subtítulo, link de WhatsApp).
- **Arquitetura Resiliente de Dados:**
  - Dados armazenados no **Supabase (Postgres)**.
  - Cache local multicamada com **IndexedDB** e **localStorage**, garantindo que o catálogo nunca fique em branco ou perca produtos caso a conexão com o Supabase falhe.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Biblioteca de Interface:** [React 19](https://react.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com PostCSS
- **Ícones:** [lucide-react](https://lucide.dev/)
- **Animações:** [motion](https://motion.dev/) (motion/react)
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/)
- **Persistência Offline:** IndexedDB nativo + LocalStorage com fallback de sanitização

---

## 📂 Estrutura de Diretórios

```plaintext
├── app/                      # Rotas e páginas do Next.js App Router
│   ├── layout.tsx            # Layout raiz com fontes e metadados SEO
│   ├── page.tsx              # Página inicial (Home) com destaques
│   ├── achadinhos/           # Catálogo completo com barra de categorias
│   ├── blog/                 # Listagem de artigos
│   ├── artigo/[id]/          # Leitura de artigo individual
│   ├── busca/                # Página de busca avançada
│   ├── campanha/             # Diretório de campanhas
│   │   └── [slug]/           # Landing page de alta conversão dinâmica
│   ├── cupons/               # Central de cupons de desconto
│   ├── login/                # Página de login administrativo com Google
│   ├── painel/               # Dashboard administrativo com abas
│   │   ├── artigos/          # Gestão de artigos
│   │   ├── campanhas/        # Gestão de landing pages
│   │   ├── categorias/       # Gestão de categorias
│   │   ├── configuracoes/    # Configurações do site
│   │   └── produtos/         # Cadastro e edição de achadinhos
│   ├── not-found.tsx         # Página 404 personalizada do App Router
│   └── globals.css           # Estilos globais e importação do Tailwind
├── components/               # Componentes reutilizáveis
│   ├── Navbar.tsx            # Barra de navegação com busca e links
│   ├── Footer.tsx            # Rodapé informativo com selos
│   ├── ProductCard.tsx       # Card de produto otimizado para conversão
│   ├── CategorySidebar.tsx   # Sidebar vertical de categorias e setores
│   ├── ProductDetailModal.tsx# Modal com galeria de fotos e detalhes
│   ├── SocialShare.tsx       # Compartilhamento no WhatsApp e redes
│   └── ImageUploader.tsx     # Otimizador e uploader de fotos
├── lib/                      # Utilitários e integrações
│   ├── constants.ts          # Catálogo inicial (55 itens), lojas e cupons
│   ├── types.ts              # Definições de tipos TypeScript
│   ├── firestore-products.ts # Camada de dados e assinaturas em tempo real
│   ├── storage.ts            # Camada de cache resiliente (IndexedDB/LocalStorage)
│   ├── AdminContext.tsx      # Contexto React com estado administrativo
│   └── image-compress.ts     # Compactação de imagens antes de salvar
├── public/                   # Arquivos públicos e imagens estáticas
│   └── images/               # Fotos oficiais de produtos e hero
├── package.json              # Dependências e scripts
└── tsconfig.json             # Configuração TypeScript
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18.18+ ou Node.js 20+
- Gerenciador de pacotes `npm` ou `yarn`

### 2. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/0xphygames/Afiliados.git
cd Afiliados
npm install
```

### 3. Configurar variáveis de ambiente (opcional)
Copie o arquivo de exemplo caso deseje adicionar chaves customizadas:
```bash
cp .env.example .env.local
```

### 4. Executar em modo desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### 5. Compilar para produção
```bash
npm run build
npm run start
```

---

## 🔒 Segurança e Regras de Negócio

- As regras de acesso do Supabase (RLS, em `supabase/migrations`) garantem que apenas a administradora com e-mail autorizado (`taper.sant@gmail.com`) consiga criar, atualizar ou excluir produtos, campanhas e configurações.
- Visitantes têm permissão estrita de **leitura pública** de produtos, artigos e cupons.
- Todas as requisições de persistência contam com sanitização para impedir estouro de cota de armazenamento no navegador.

---

## 📄 Licença

Projeto proprietário – Tamires Santos © Todos os direitos reservados.
