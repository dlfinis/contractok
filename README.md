# ContractOK – Miniapp para WorldChain

Aplicación mobile-first para crear y acordar contratos con garantías económicas, aprobación bilateral y resolución de disputas (IA/Comunidad). Autenticación obligatoria vía World ID. 

## Estructura del Proyecto

- `/frontend`: React 18 + Vite, framer-motion, wagmi, World ID SDK
- `/contracts`: Solidity 0.8.20, Hardhat, ContratoMaestro.sol
- `/backend`: NestJS, Prisma (SQLite), validación World ID, endpoints críticos

## Instalación Rápida

### 1. Clona el repositorio
```bash
git clone <URL_DEL_REPO>
cd contractok
```

### 2. Configura variables de entorno
Copia los archivos `.env.example` de cada subcarpeta (`frontend`, `backend`, `contracts`) a `.env` y edítalos con tus valores:

- WORLDCOIN_ACTION_ID
- WORLDCHAIN_RPC
- CONTRATO_MAESTRO_ADDRESS

### 3. Instalación de dependencias
```bash
cd frontend && npm install
cd ../contracts && npm install
cd ../backend && npm install
```

### 4. Despliegue
#### Frontend
- Ejecuta `npm run dev` en `/frontend` para desarrollo local.
- Despliega en Vercel (SPA, optimizeCss activado).

#### Backend
- Ejecuta `npm run start:dev` en `/backend` para desarrollo local.
- Despliega en Vercel Serverless Functions.

#### Contrato
- Configura `.env` con tu RPC de WorldChain.
- Despliega usando Hardhat (`npx hardhat run scripts/deploy.js --network worldchain`).

### 5. Pruebas de flujo completo
Simula los flujos descritos en la documentación para validar la app.

## Estructura de carpetas
- `/frontend`: App React (Vite)
- `/contracts`: Smart Contracts (Solidity/Hardhat)
- `/backend`: NestJS + Prisma

## Soporte
- Discord: [enlace]
- Email: [soporte@contractok.com]

---

## Variables de Entorno
Incluye ejemplos en cada `.env.example` según corresponda.

---

## Pruebas
- Simula creación, aprobación, disputa y cierre de contratos siguiendo los casos de uso descritos.

## Créditos
- UI: Azul marino (#0A2E5A), verde esmeralda (#00A878), amarillo vibrante (#FFD700)
- Animaciones: framer-motion, react-hot-toast, react-confetti
- Autenticación: World ID (IDKit)
- Blockchain: WorldChain
