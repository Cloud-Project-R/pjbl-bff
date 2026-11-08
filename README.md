# pjbl-bff

**BFF (Backend for Frontend)** da Plataforma de Reservas de Salas Universitárias (PJBL – Entrega 3).
É a única porta de entrada do front: o front nunca chama os microserviços direto.

O BFF tem duas funções:
1. **Proxy do CRUD:** repassa `/salas` ao MS Salas e `/reservas` ao MS Reservas.
2. **Agregação:** `GET /aggregated-data` chama o MS Salas, o MS Reservas e a Azure Function
   e devolve tudo em **um único JSON**.

## Arquitetura

```
Front → API Gateway → BFF ─┬→ MS Salas (MongoDB Atlas)
                           ├→ MS Reservas (Azure SQL) ──evento──→ fila → Function
                           └→ Azure Function (ocupação e notificações)
```

O código segue **Clean Architecture** e **Vertical Slice**:

```
src/
├─ domain/            formatos dos dados (Sala, Reserva, Ocupacao...) e erros
├─ application/
│  ├─ buscar-dados-agregados/   a fatia do GET /aggregated-data
│  └─ portas.ts                 "portas" para MS Salas, MS Reservas e Function
├─ infrastructure/
│  └─ http/           clientes HTTP (fetch) de cada serviço
├─ api/               controllers (proxy + agregação), DTOs e Swagger
├─ app.module.ts      liga todas as peças
└─ main.ts            sobe o servidor e o Swagger em /docs
test/architecture/    teste que confere a regra de dependência entre camadas
```

**Tolerância a falhas:** no `/aggregated-data`, os serviços são chamados ao mesmo tempo. Se um
cair, o campo dele vem `null` e o motivo aparece em `erros`, sem derrubar a resposta.

**Erros dos serviços:** se o MS Reservas responder 409 (conflito), o BFF devolve o mesmo 409 e a
mesma mensagem ao front. Se um serviço nem responder, o BFF devolve 502.

### Rotas

| Método | Rota | O que faz |
|---|---|---|
| GET | `/aggregated-data` | Chama Salas, Reservas e Function e devolve tudo em um JSON |
| POST, GET, GET/:id, PUT, DELETE | `/salas` e `/reservas` | Repassa o CRUD aos microserviços (proxy) |
| GET | `/health` | Responde ok |

Exemplo de `GET /aggregated-data`:

```json
{
  "salas": [{ "id": "s1", "nome": "Sala 101", "capacidade": 30, "universidadeId": "UNI-001", "ativa": true }],
  "reservas": [{ "id": "r1", "salaId": "s1", "alunoId": "A-10", "inicio": "2026-11-10T13:00:00Z", "fim": "2026-11-10T14:00:00Z", "estado": "CONFIRMADA" }],
  "ocupacao": { "reservasPorSala": 1, "nivel": "MEDIA" },
  "notificacoes": [{ "reservaId": "r1", "mensagem": "E-mail simulado enviado ao aluno A-10" }],
  "erros": []
}
```

## API Gateway (Azure API Management)

Na nuvem, o front não chama o BFF direto: ele passa pelo **Azure API Management**
(`apim-pjbl-reservas`, plano Consumo), que fica na frente do BFF.

- **Roteamento:** `https://apim-pjbl-reservas.azure-api.net/reservas/*` → BFF. As rotas foram
  importadas do Swagger do BFF (`/docs-json`).
- **Segurança:** toda chamada precisa da chave de assinatura no cabeçalho
  `Ocp-Apim-Subscription-Key` (sem ela: 401) e há limite de 100 chamadas por minuto.
- **CORS:** só o endereço do front pode chamar pelo navegador. O CORS fica **só no Gateway**
  (no BFF ele fica desligado na nuvem), para o navegador não receber o cabeçalho duplicado.

A política aplicada está em [`gateway/politica-apim.xml`](gateway/politica-apim.xml).

## Tecnologias

Node 22, TypeScript, NestJS, Swagger, Jest, Docker, Azure Container Apps.

## Como rodar

**Local**

1. Copie `.env.example` para `.env` e preencha (URLs dos serviços e chave da Function).
2. `npm ci`
3. `npm run start:dev`
4. Abra http://localhost:3000/docs

**Testes:** `npm test` (unitários com clientes falsos + arquitetura).

**Docker**

```bash
docker build --platform linux/amd64 -t joaovmb/pjbl-bff:v1 .
docker run --rm -p 3000:3000 --env-file .env joaovmb/pjbl-bff:v1
```

**Nuvem**

- Swagger: https://URL-DO-BFF/docs
- Imagem: `docker pull joaovmb/pjbl-bff:v1`

## Equipe

João Vitor de Moraes Bringmann, Leonardo Grattão, Eduardo Monteiro, Nicolas Lobo
