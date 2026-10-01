# Ninho — Sistema de Aluguel de Imóveis

Aplicação full-stack de aluguel de imóveis: clientes anunciam e reservam imóveis, admins moderam destaques e interações. Inclui recursos de IA (descrição/preço sugeridos, insight de bairro) e e-mail transacional.

**Em produção:**
- Frontend: https://ninho-kappa.vercel.app
- Backend: https://ninho-api.onrender.com

## Stack

- **Backend**: Node.js, Express 5, TypeScript, Prisma (PostgreSQL via Supabase), JWT em cookie httpOnly
- **Frontend**: React, Vite, TypeScript, Tailwind CSS v4, react-hook-form, react-router-dom
- **IA**: Google Gemini (descrição/preço sugeridos ao anunciar, insight de bairro na home)
- **E-mail**: Resend (resposta do admin a uma interação, recuperação de senha)
- **Deploy**: Render (backend) + Vercel (frontend) + Supabase (banco) — ver [DEPLOY.md](DEPLOY.md)

## Funcionalidades

- Cadastro/login de clientes e admins (sessão via cookie httpOnly)
- Recuperação de senha por e-mail (link com token de uso único, expira em 30 min)
- CRUD de imóveis com upload de fotos (arquivo ou URL), seleção de capa
- Reservas com bloqueio de sobreposição de datas, avaliação (nota + comentário) pós-reserva
- Painel admin: dashboard com gráficos, moderação de imóveis em destaque, resposta a interações (com e-mail automático ao cliente)
- Geração de descrição + sugestão de preço via IA ao anunciar um imóvel
- Insight de bairro gerado por IA na página inicial e na página do imóvel

## Estrutura

```
backend/   API Express + Prisma (src/routes, lib/)
frontend/  SPA React + Vite (src/pages, src/components)
DEPLOY.md  Passo a passo de deploy (Render + Vercel + Supabase)
```

## Rodando localmente

```bash
# banco local (Prisma Postgres)
cd backend
npx prisma dev        # deixa rodando em background

# backend
cp .env.example .env  # preencha as variáveis
npm install
npm run dev            # http://localhost:3000

# frontend (outro terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

## Segurança

O backend aplica, entre outras medidas:

- Autenticação via cookie **httpOnly + Secure + SameSite** (token de sessão nunca fica acessível a JavaScript no navegador, nem é exposto a um eventual XSS)
- **Rate limiting** geral e reforçado em login/cadastro/recuperação de senha (proteção contra força bruta e credential stuffing)
- **CORS** restrito à origem exata do frontend, com `credentials: true`
- **Helmet** para cabeçalhos de segurança (HSTS, X-Content-Type-Options, X-Frame-Options etc.)
- **CSP** no frontend (Vercel), além de Permissions-Policy e Referrer-Policy
- Senhas com **bcrypt** (12 rounds); tokens de recuperação de senha armazenados como hash SHA-256, de uso único e com expiração
- Upload de imagens restrito a formatos raster (JPEG/PNG/GIF/WEBP) — SVG é bloqueado para evitar XSS armazenado via arquivo
- Defesa contra CSRF em requisições "simples" do CORS (upload de fotos exige header customizado, validado também no backend)
- E-mails transacionais escapam conteúdo informado por usuários antes de montar o HTML
- Erros nunca vazam detalhes internos (stack trace, objeto de erro do Prisma) nas respostas da API — só mensagens genéricas, com o erro completo logado só no servidor
- `JWT_SECRET` obrigatório — o servidor recusa subir sem ele configurado

## Histórico de mudanças recentes

- **Autenticação migrada de JWT no LocalStorage para cookie httpOnly** — fecha a superfície de roubo de sessão via XSS
- **Bateria de medidas de ciberseguranca** aplicada de ponta a ponta (ver seção acima)
- **Recuperação de senha por e-mail** para contas de cliente
- **Redesign visual completo** — identidade de marca própria (paleta, tipografia, logo), componentes de UI reutilizáveis, aplicado em todas as páginas (cliente e admin)
- Geração de descrição e sugestão de preço via IA ao anunciar um imóvel
- Bloqueio de reservas sobrepostas no mesmo imóvel
- Melhorias no fluxo de upload de fotos (anexar por URL, anexar durante o cadastro do imóvel)
