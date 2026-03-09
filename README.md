# Order Management API

API RESTful para gerenciamento de pedidos desenvolvida com **Node.js**, **Express** e **SQL Server**.

## Funcionalidades

- CRUD completo de pedidos e seus itens
- Validação de dados de entrada com mensagens de erro descritivas
- Mapeamento de campos (campos em português → esquema do banco em inglês)
- SQL Server com suporte a transações
- Autenticação JWT Bearer token (opcional, habilitada por padrão)
- Encerramento gracioso e pool de conexões

---

## Estrutura do Projeto

```
order-api/
├── src/
│   ├── config/
│   │   ├── database.js        # Pool de conexão com SQL Server
│   │   └── migrate.js         # Script de criação das tabelas
│   ├── controllers/
│   │   └── orderController.js # Camada HTTP
│   ├── middlewares/
│   │   ├── authMiddleware.js  # Autenticação JWT
│   │   └── orderValidator.js  # Regras de validação das requisições
│   ├── repositories/
│   │   └── orderRepository.js # Queries SQL diretas
│   ├── routes/
│   │   ├── authRoutes.js      # POST /auth/token
│   │   └── orderRoutes.js     # Endpoints /order
│   ├── services/
│   │   └── orderService.js    # Regras de negócio
│   ├── utils/
│   │   ├── orderMapper.js     # Mapeamento de campos
│   │   └── responseHelper.js  # Respostas padronizadas
│   ├── app.js                 # Configuração do Express
│   └── server.js              # Ponto de entrada
├── .env.example
├── .gitignore
└── package.json
```

---

## Pré-requisitos

- Node.js 18+
- SQL Server (local ou remoto)

---

## Configuração

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/RenteriaJuan/order-management-api.git
cd order-api
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com as credenciais do seu SQL Server:

```env
PORT=3000
DB_SERVER=localhost
DB_PORT=1433
DB_USER=apiuser
DB_PASSWORD=sua_senha
DB_NAME=OrderManagementDB
DB_TRUSTED_CONNECTION=false
DB_ENCRYPT=false

JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=24h
```

### 3. Criar as tabelas do banco de dados

```bash
npm run migrate
```

### 4. Iniciar o servidor

```bash
# Desenvolvimento (com recarregamento automático)
npm run dev

# Produção
npm start
```

---

## Autenticação

Todos os endpoints de pedidos requerem um token JWT Bearer.

**1. Obter um token:**

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"api-client","secret":"dev-secret"}'
```

**2. Usar o token nas requisições:**

```bash
-H "Authorization: Bearer <seu-token>"
```

> Para desabilitar a autenticação, remova o middleware `authenticate` de `src/routes/orderRoutes.js`.

---

## Endpoints da API

### URL Base: `http://localhost:3000`

| Método | URL | Descrição |
|--------|-----|-----------|
| POST | `/auth/token` | Obter token JWT |
| POST | `/order` | Criar pedido |
| GET | `/order/list` | Listar todos os pedidos |
| GET | `/order/:orderId` | Buscar pedido por ID |
| PUT | `/order/:orderId` | Atualizar pedido |
| DELETE | `/order/:orderId` | Deletar pedido |
| GET | `/health` | Verificação de saúde da API |

---

## Exemplos de Requisição e Resposta

### Criar Pedido — `POST /order`

**Requisição:**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**Resposta `201`:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.530Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
}
```

### Buscar Pedido — `GET /order/v10089015vdb-01`

**Resposta `200`:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": { ... }
}
```

### Resposta de Erro

```json
{
  "success": false,
  "message": "Order \"v10089015vdb-01\" not found"
}
```

---

## Mapeamento de Dados

A API recebe os campos em português e os transforma para o esquema interno em inglês antes de salvar no banco:

| Campo da Requisição | Coluna no Banco | Observação |
|---|---|---|
| `numeroPedido` | `orderId` | String |
| `valorTotal` | `value` | Decimal |
| `dataCriacao` | `creationDate` | ISO 8601 → DateTime2 |
| `items[].idItem` | `productId` | Convertido para INT |
| `items[].quantidadeItem` | `quantity` | INT |
| `items[].valorItem` | `price` | Decimal |

---

## Esquema do Banco de Dados

```sql
CREATE TABLE [Order] (
  orderId       NVARCHAR(100)  PRIMARY KEY,
  value         DECIMAL(18,2)  NOT NULL,
  creationDate  DATETIME2      NOT NULL,
  createdAt     DATETIME2      DEFAULT GETUTCDATE(),
  updatedAt     DATETIME2      DEFAULT GETUTCDATE()
);

CREATE TABLE [Items] (
  id         INT IDENTITY(1,1) PRIMARY KEY,
  orderId    NVARCHAR(100) REFERENCES [Order](orderId) ON DELETE CASCADE,
  productId  INT           NOT NULL,
  quantity   INT           NOT NULL,
  price      DECIMAL(18,2) NOT NULL
);
```

---

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro de validação |
| 401 | Token ausente ou inválido |
| 404 | Pedido não encontrado |
| 409 | ID do pedido já existe |
| 500 | Erro interno do servidor |

---

## Convenção de Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar endpoint de criação de pedido
fix: tratar duplicidade de orderId na criação
refactor: extrair mapper para módulo utilitário
docs: adicionar exemplos de uso da API no README
```