# 🏢 Itos Platform

Plataforma de inversiones tokenizadas que permite a inversores colombianos acceder a proyectos inmobiliarios y de equity desde $10,000 COP mediante tokens ERC-20 con custodia fiduciaria.

## ✨ Características

- **💰 Inversión Accesible**: Desde $10,000 COP por token
- **⛓️ Blockchain**: Tokens ERC-20 en Ethereum
- **🏛️ Custodia Fiduciaria**: Seguridad institucional regulada
- **🗳️ Gobernanza**: Votación proporcional por tokens
- **📊 Dashboard**: Portfolio y señales de mercado en tiempo real
- **🔒 KYC**: Verificación de identidad integrada

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+
- MetaMask (para funciones blockchain)
- Acceso a Sepolia Testnet

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/your-username/itos-platform.git
cd itos-platform
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en navegador**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
itos-platform/
├── 📁 public/
│   ├── index.html          # Estructura principal
│   ├── 📁 css/
│   │   ├── main.css        # Estilos principales
│   │   ├── components.css  # Componentes específicos
│   │   └── dashboard.css   # Dashboard y portfolio
│   ├── 📁 js/
│   │   ├── app.js          # Lógica principal
│   │   ├── contracts.js    # Integración blockchain
│   │   ├── dashboard.js    # Funciones del dashboard
│   │   └── utils.js        # Utilidades
│   └── 📁 assets/
│       └── images/
├── 📁 contracts/
│   ├── MockUSDC.sol
│   ├── ItosToken.sol
│   └── ItosInvestmentEscrow.sol
├── package.json
└── README.md
```

## 🎯 Funcionalidades Principales

### 🔐 Autenticación
- Login/registro con validación
- KYC básico (cédula, teléfono)
- Estados de verificación

### 💎 Inversiones
- Selección de tokens enteros (1, 2, 3...)
- Precio fijo: $10,000 COP por token
- Comisión Itos: 2%
- Custodia fiduciaria o wallet personal

### 📊 Dashboard
- Portfolio con valores actualizados
- Señales de mercado en tiempo real
- Historial de inversiones
- Acciones de gobernanza por proyecto

### 🗳️ Gobernanza
- Propuestas específicas por proyecto
- Votación ponderada por tokens
- Liquidaciones anticipadas
- Decisiones de ampliación

### ⛓️ Blockchain
- Contratos en Sepolia Testnet
- Integración con MetaMask
- Fallback a simulación
- Testing de contratos

## 🧪 Testing

### Credenciales Demo
```
Email: juan@itos.co
Contraseña: demo123
```

### Contratos en Sepolia
```
USDC: 0xb3Ded8E7ACa1209D1c1BEB3D3057662925B548Ce
Token: 0x8E412CB79bBAE7aFE657F7711199F393a3652D8b
Escrow: 0x8c4a676dD02DEB0a880E799FAe3805466B3e7A82
```

### Probar Contratos
1. Cambiar MetaMask a Sepolia
2. Obtener ETH: https://sepoliafaucet.com/
3. Login en la plataforma
4. Click en "Probar Conexión" (consola)

## 🔧 Desarrollo

### Comandos Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Servidor de producción
npm start

# Futuras funcionalidades
npm run build
npm test
npm run lint
```

### Extensiones VSCode Recomendadas
- Live Server
- Solidity
- Prettier
- ES6 String HTML
- Auto Rename Tag

## 🏗️ Arquitectura

### Frontend
- **Vanilla JavaScript** (modular)
- **CSS Grid/Flexbox** (responsive)
- **Ethers.js** (blockchain)

### Smart Contracts
- **MockUSDC**: Token de prueba
- **ItosToken**: Participaciones (decimals=0)
- **ItosInvestmentEscrow**: Lógica de inversión

### Flujo de Inversión
1. Usuario paga COP (simulado)
2. Itos convierte a USDC (simulado)
3. Blockchain: `approve()` + `invest()` (real)
4. Tokens distribuidos (real)
5. Custodia según preferencia

## 🚧 Roadmap

### Fase 1: MVP ✅
- [x] Frontend funcional
- [x] Contratos básicos
- [x] Simulación completa
- [x] Testing en Sepolia

### Fase 2: Blockchain Real 🔄
- [ ] Conexión MetaMask estable
- [ ] Testing exhaustivo contratos
- [ ] Manejo de errores blockchain
- [ ] Gas optimization

### Fase 3: Backend 📋
- [ ] Node.js + Express
- [ ] Base de datos usuarios
- [ ] KYC real
- [ ] API endpoints

### Fase 4: Producción 🎯
- [ ] Deploy mainnet
- [ ] Integración bancaria
- [ ] Auditoria contratos
- [ ] Launch

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-username/itos-platform/issues)
- **Email**: soporte@itos.co
- **Docs**: [docs.itos.co](https://docs.itos.co)

## 📞 Contacto

- **Website**: [itos.co](https://itos.co)
- **Twitter**: [@itos_co](https://twitter.com/itos_co)
- **LinkedIn**: [Itos](https://linkedin.com/company/itos)

---

**⚠️ Disclaimer**: Esta es una plataforma en desarrollo para testing. No usar con fondos reales en mainnet sin auditoría completa.