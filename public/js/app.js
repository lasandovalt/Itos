// ============================
// CONFIGURACIÓN
// ============================
const API_URL = "http://localhost:3000";

// App State
let currentUser = null;
let isLoggedIn = false;
let userInvestments = [];
let userBalance = 5000000; // 5M COP initial balance

// Constants
const TOKEN_PRICE_COP = 10000; // 10,000 COP per token
const ITOS_FEE = 0.02; // 2% fee

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateAuthButton();
    initializeKYCStatus();
});

// ============================
// AUTHENTICACIÓN
// ============================
function updateAuthButton() {
    const authButton = document.getElementById('authButton');
    const navDashboard = document.getElementById('nav-dashboard');
    
    if (isLoggedIn && currentUser) {
        authButton.innerHTML = `<span style="color: #333; font-weight: 600;">👋 ${currentUser.name}</span>`;
        navDashboard.style.display = 'block';
    } else {
        authButton.innerHTML = `
            <a href="#" class="btn btn-secondary" onclick="openAuthModal()">Iniciar sesión</a>
            <a href="#" class="btn btn-primary" onclick="openAuthModal('register')">Registrarme</a>
        `;
        navDashboard.style.display = 'none';
    }
}

function openAuthModal(type = 'login') {
    document.getElementById('authModal').style.display = 'block';
    if (type === 'register') {
        showRegister();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    showNotification('🔐 Verificando credenciales...', 'info');
    await simulateDelay(1500);
    
    currentUser = {
        name: 'Juan Pérez',
        email: email,
        cedula: '12345678',
        phone: '300 123 4567',
        wallet: '0x742d35Cc6B342e2c8aF53a7e0bF0cb92e12341c5',
        kycStatus: 'verified',
        registrationDate: '2024-01-15'
    };
    
    if (email === 'juan@itos.co') {
        userInvestments = [
            {
                id: 1,
                project: 'Residencial La Sabana',
                tokens: 12,
                investedAmount: 120000,
                currentValue: 135000,
                date: '2024-03-15',
                custody: 'fiduciary',
                status: 'active'
            }
        ];
        userBalance = 3500000;
    }
    
    isLoggedIn = true;
    updateAuthButton();
    closeModal();
    showNotification('✅ ¡Bienvenido de vuelta!', 'success');
    setTimeout(() => {
        showSection('dashboard');
    }, 1000);
}

async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const cedula = document.getElementById('registerCedula').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const wallet = document.getElementById('registerWallet').value;

    if (!name || !email || !cedula || !phone || !password) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }

    if (cedula.length < 7) {
        showNotification('Cédula debe tener al menos 7 dígitos', 'error');
        return;
    }

    showNotification('📝 Creando cuenta...', 'info');
    await simulateDelay(2000);
    
    currentUser = {
        name: name,
        email: email,
        cedula: cedula,
        phone: phone,
        wallet: wallet || '0x' + Math.random().toString(16).substr(2, 40),
        kycStatus: 'pending',
        registrationDate: new Date().toISOString().split('T')[0]
    };
    
    userInvestments = [];
    userBalance = 5000000;
    isLoggedIn = true;
    updateAuthButton();
    closeModal();
    showNotification('✅ ¡Cuenta creada exitosamente!', 'success');
    showNotification('📋 Completaremos tu verificación KYC en 24-48 horas', 'info');
    setTimeout(() => {
        showSection('dashboard');
    }, 1000);
}

// ============================
// NAVEGACIÓN
// ============================
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(sectionName);
    if (targetSection) targetSection.classList.add('active');
    document.querySelectorAll('.nav-menu a').forEach(item => item.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${sectionName}`);
    if (activeNav) activeNav.classList.add('active');
    if (sectionName === 'dashboard') {
        updateDashboard();
    }
}

// ============================
// INVERSIÓN
// ============================
function openInvestmentModal(projectId) {
    if (!isLoggedIn) {
        showNotification('Por favor inicia sesión para invertir', 'warning');
        openAuthModal();
        return;
    }
    if (currentUser.kycStatus !== 'verified') {
        showNotification('Necesitas completar la verificación KYC para invertir', 'warning');
        return;
    }
    document.getElementById('investmentModal').style.display = 'block';
    document.getElementById('tokenAmount').value = 1;
    updateFromTokens();
    updateCustodyInfo();
}

function updateFromTokens() {
    const tokens = parseInt(document.getElementById('tokenAmount').value) || 1;
    const investmentAmount = tokens * TOKEN_PRICE_COP;
    const fee = investmentAmount * ITOS_FEE;
    const total = investmentAmount + fee;
    document.getElementById('summaryTokens').textContent = tokens;
    document.getElementById('summaryAmountCOP').textContent = `${investmentAmount.toLocaleString()} COP`;
    document.getElementById('summaryFee').textContent = `${fee.toLocaleString()} COP`;
    document.getElementById('summaryTotal').textContent = `${total.toLocaleString()} COP`;
}

async function processInvestment() {
    const tokens = parseInt(document.getElementById('tokenAmount').value);
    const custodyType = document.getElementById('custodyType').value;
    const investmentAmount = tokens * TOKEN_PRICE_COP;
    const totalCOP = investmentAmount * (1 + ITOS_FEE);

    if (totalCOP > userBalance) {
        showNotification('Saldo insuficiente', 'error');
        return;
    }

    try {
        // 🔹 Aquí llamamos al backend real
        showNotification('💳 Procesando pago...', 'info');
        await simulateDelay(1000);

        const res = await fetch(`${API_URL}/invest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tokens,
                custodyType,
                amountUSDC: tokens // suponemos 1 token = 1 USDC en backend
            })
        });

        const data = await res.json();
        if (res.ok) {
            showNotification('✅ Inversión confirmada en blockchain', 'success');
            console.log('Tx Hash:', data.txHash);

            userBalance -= totalCOP;
            userInvestments.push({
                id: Date.now(),
                project: 'Torre Empresarial Chapinero',
                tokens,
                investedAmount: investmentAmount,
                currentValue: investmentAmount,
                date: new Date().toISOString().split('T')[0],
                custody: custodyType,
                status: 'active'
            });
            closeModal();
            updateDashboard();
        } else {
            showNotification('❌ Error en inversión: ' + data.error, 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification('❌ Error conectando con backend', 'error');
    }
}

// ============================
// UTILIDADES
// ============================
function closeModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('investmentModal').style.display = 'none';
    document.getElementById('transferModal').style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

