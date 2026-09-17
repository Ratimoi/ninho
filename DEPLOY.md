# Deploy — Ninho

Passo a passo pra colocar o projeto no ar: banco no Neon, backend no Render, frontend na Vercel.

## 1. Banco de dados (Neon)

1. Crie uma conta em https://neon.tech e um novo projeto/banco Postgres.
2. Copie a **connection string** (formato `postgresql://usuario:senha@host/banco?sslmode=require`).
3. Guarde essa URL — vai virar a `DATABASE_URL` do backend no Render.

## 2. Backend (Render)

1. Crie uma conta em https://render.com e um **Web Service** novo, apontando pro repositório do GitHub.
2. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Variáveis de ambiente (aba *Environment*):
   - `DATABASE_URL` — a connection string do Neon (passo 1).
   - `JWT_SECRET` — um valor aleatório forte (ex: gere com `openssl rand -hex 32`).
   - `ANTHROPIC_API_KEY` — opcional, ativa o insight de IA na página do imóvel.
   - `FRONTEND_URL` — a URL da Vercel (passo 3); pode deixar em branco por enquanto e preencher depois.
4. Depois do primeiro deploy, rode as migrations contra o banco do Neon (uma vez, localmente):
   ```bash
   cd backend
   DATABASE_URL="<url do neon>" npx prisma db push
   ```
5. Anote a URL pública que o Render gerou (ex: `https://ninho-api.onrender.com`) — vai virar a `VITE_API_URL` do frontend.

**Atenção:** o upload de imagens (`backend/uploads`) grava no disco do servidor. No plano gratuito do Render o disco é efêmero — as fotos enviadas somem a cada novo deploy/reinício. Pra persistir de verdade, seria preciso um storage externo (S3, Cloudinary etc.), fora do escopo deste trabalho.

## 3. Frontend (Vercel)

1. Crie uma conta em https://vercel.com e importe o repositório do GitHub.
2. Configure:
   - **Root Directory**: `frontend`
   - Framework preset: Vite (detecta sozinho)
3. Variável de ambiente:
   - `VITE_API_URL` — a URL do backend no Render (passo 2.5).
4. Depois do deploy, pegue a URL da Vercel (ex: `https://ninho.vercel.app`) e volte no Render pra preencher `FRONTEND_URL` com ela — assim o CORS do backend passa a aceitar só essa origem.

## 4. Conferindo

- Abra a URL da Vercel, cadastre um cliente, cadastre um imóvel, reserve.
- Pra criar o primeiro admin, chame uma vez (Postman/curl/thunder client):
  ```bash
  curl -X POST https://<url-do-render>/admin/cadastro \
    -H "Content-Type: application/json" \
    -d '{"nome":"Admin","email":"admin@exemplo.com","senha":"senha-forte"}'
  ```
  Depois disso, use `/admin/login` normalmente pela interface (`/admin/login` no frontend).
