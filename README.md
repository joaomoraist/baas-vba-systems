# VBA Systems — BaaS

Desafio técnico de Banking as a Service (BaaS) desenvolvido para a VBA Systems.
A aplicação integra uma API BaaS própria ao gateway de pagamentos Lera Box / BranchPay, utilizando NestJS, MySQL e React.

## Tecnologias

- NestJS + TypeScript
- TypeORM
- MySQL 8.4
- React + Vite
- Docker + Docker Compose
- Swagger

---

## Setup local

### 1. Pré-requisitos

Instale:

- Node.js 18+
- npm
- Docker
- Docker Compose
- Git

### 2. Clonar o projeto

```bash
git clone https://github.com/joaomoraist/baas-vba-systems
cd baas-vba-systems
```

### 3. Subir o banco de dados

O MySQL é executado através do Docker Compose.

Na raiz do projeto:

```bash
docker compose up -d
```

O banco será criado automaticamente com:

- Database: `baas_vba`
- Porta: `3307`
- Usuário: `root`
- Senha: `root`

Para verificar:

```bash
docker compose ps
```

### 4. Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` com o seguinte conteúdo (Use o .env.example para consulta):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=baas_vba
GATEWAY_BASE_URL=https://api.branchpay.com.br/api
LERA_BOX_WEBHOOK_SECRET=seu_segredo
```

Inicie a aplicação:

```bash
npm run start:dev
```

Backend disponível em:

```
http://localhost:3000
```

Swagger:

```
http://localhost:3000/docs
```

### 5. Frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

O endereço será exibido no terminal, normalmente:

```
http://localhost:5173
```

---

## Fluxo para testar

Após iniciar backend e frontend:

1. Criar um usuário no BaaS.
2. Realizar o login da conta no Gateway.
3. Consultar as tarifas.
4. Criar um checkout Pix ou cartão.
5. Consultar saldo e extrato.
6. Realizar um saque.
7. Configurar e testar os webhooks.

A API também pode ser testada diretamente pelo Swagger:

```
http://localhost:3000/docs
```
