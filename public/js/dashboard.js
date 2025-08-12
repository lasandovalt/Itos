// Dashboard Functions

function updateDashboard() {
    if (!currentUser) return;
    
    updatePortfolioValue();
    updatePortfolioList();
    updateKYCStatus();
    updateProjectActions();
    updateMarketSignals();
}

function updatePortfolioValue() {
    const totalValue = userInvestments.reduce((sum, investment) => {
        return sum + investment.currentValue;
    }, 0);
    
    document.getElementById('portfolioValue').textContent = `$${totalValue.toLocaleString()} COP`;
}

function updatePortfolioList() {
    const portfolioList = document.getElementById('portfolioList');
    
    if (userInvestments.length === 0) {
        portfolioList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div class="empty-title">No tienes inversiones activas</div>
                <div class="empty-subtitle">Explora nuestros proyectos y comienza a invertir</div>
                <button class="btn btn-primary" onclick="showSection('projects')">Ver Proyectos</button>
            </div>
        `;
        return;
    }
    
    portfolioList.innerHTML = userInvestments.map(investment => {
        const change = ((investment.currentValue - investment.investedAmount) / investment.investedAmount * 100).toFixed(1);
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSign = change >= 0 ? '+' : '';
        
        return `
            <div class="portfolio-item">
                <div class="portfolio-info">
                    <div class="portfolio-name">${investment.project}</div>
                    <div class="portfolio-details">
                        <span>💎 ${investment.tokens} tokens</span>
                        <span>📅 ${formatDate(investment.date)}</span>
                        <span>🏛️ ${investment.custody === 'fiduciary' ? 'Fiduciaria' : 'Wallet'}</span>
                    </div>
                    ${investment.custody === 'fiduciary' ? `
                        <div class="portfolio-actions">
                            <button class="portfolio-action-btn" onclick="openTransferModal(${JSON.stringify(investment).replace(/"/g, '&quot;')})">
                                Transferir
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="portfolio-value">
                    <div class="portfolio-amount">$${investment.currentValue.toLocaleString()} COP</div>
                    <div class="portfolio-change ${changeClass}">${changeSign}${change}%</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateKYCStatus() {
    const kycStatus = document.getElementById('kycStatus');
    if (!kycStatus) return;
    
    let statusHtml = '';
    
    switch (currentUser.kycStatus) {
        case 'pending':
            statusHtml = `
                <div class="kyc-status pending">
                    <div class="kyc-icon">⏳</div>
                    <div class="kyc-info">
                        <h4>Verificación en Proceso</h4>
                        <p>Tu documentación está siendo revisada. Recibirás una notificación en 24-48 horas.</p>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-outline btn-small" onclick="uploadKYCDocument()">
                        📄 Subir Documentos Adicionales
                    </button>
                </div>
            `;
            break;
        
        case 'verified':
            statusHtml = `
                <div class="kyc-status verified">
                    <div class="kyc-icon">✅</div>
                    <div class="kyc-info">
                        <h4>Cuenta Verificada</h4>
                        <p>Tu identidad ha sido confirmada. Puedes invertir sin restricciones.</p>
                    </div>
                </div>
            `;
            break;
        
        case 'rejected':
            statusHtml = `
                <div class="kyc-status rejected">
                    <div class="kyc-icon">❌</div>
                    <div class="kyc-info">
                        <h4>Verificación Rechazada</h4>
                        <p>Algunos documentos necesitan ser actualizados. Contacta soporte para más información.</p>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary btn-small" onclick="retryKYC()">
                        🔄 Reintentar Verificación
                    </button>
                </div>
            `;
            break;
    }
    
    kycStatus.innerHTML = statusHtml;
}

function updateProjectActions() {
    const projectActionsCard = document.getElementById('projectActionsCard');
    const projectActionsList = document.getElementById('projectActionsList');
    
    if (userInvestments.length === 0) {
        projectActionsCard.style.display = 'none';
        return;
    }
    
    projectActionsCard.style.display = 'block';
    projectActionsList.innerHTML = generateProjectActions();
}

function generateProjectActions() {
    // Group investments by project
    const projectGroups = {};
    userInvestments.forEach(investment => {
        if (!projectGroups[investment.project]) {
            projectGroups[investment.project] = { tokens: 0, investments: [] };
        }
        projectGroups[investment.project].tokens += investment.tokens;
        projectGroups[investment.project].investments.push(investment);
    });

    return Object.entries(projectGroups).map(([projectName, data]) => {
        const proposals = getProposalsForProject(projectName);
        
        return `
            <div class="project-action-item">
                <div class="action-header">
                    <div class="action-project">${projectName}</div>
                    <div class="action-tokens">${data.tokens} tokens</div>
                </div>
                
                <div class="action-proposals">
                    ${proposals.map(proposal => `
                        <div class="proposal-item">
                            <div class="proposal-title">${proposal.title}</div>
                            <div class="proposal-description">${proposal.description}</div>
                            <div class="proposal-voting">
                                <button class="btn btn-primary btn-small" onclick="vote('${proposal.id}', 'yes', ${data.tokens})">
                                    ✅ A Favor
                                </button>
                                <button class="btn btn-outline btn-small" onclick="vote('${proposal.id}', 'no', ${data.tokens})">
                                    ❌ En Contra
                                </button>
                                <div class="vote-count">
                                    <strong>${Math.round(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst) * 100)}% a favor</strong>
                                    ${proposal.votesFor} vs ${proposal.votesAgainst} tokens
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function getProposalsForProject(projectName) {
    switch (projectName) {
        case 'Torre Empresarial Chapinero':
            return [
                {
                    id: 'chapinero_liquidation',
                    title: '🏢 Liquidación Anticipada',
                    description: 'Oferta de compra por $5,800M COP (16% sobre proyección). Votar para aceptar y distribuir ganancias.',
                    votesFor: 234,
                    votesAgainst: 124
                },
                {
                    id: 'chapinero_expansion',
                    title: '🏗️ Ampliación del Proyecto',
                    description: 'Agregar 2 pisos adicionales con inversión extra de $1,500M COP. ROI proyectado subiría a 22%.',
                    votesFor: 189,
                    votesAgainst: 167
                }
            ];
        
        case 'Residencial La Sabana':
            return [
                {
                    id: 'sabana_dividends',
                    title: '💰 Distribución de Dividendos',
                    description: 'Proyecto completado exitosamente. Autorizar distribución final de ganancias (16.5% ROI).',
                    votesFor: 421,
                    votesAgainst: 78
                }
            ];
        
        case 'StartUp TechFlow':
            return [
                {
                    id: 'techflow_series_b',
                    title: '🚀 Participar en Serie B',
                    description: 'TechFlow levanta Serie B de $2M USD. Opción de participar con tokens adicionales para mantener %.',
                    votesFor: 156,
                    votesAgainst: 89
                }
            ];
        
        default:
            return [];
    }
}

function updateMarketSignals() {
    // Simulate real-time updates
    const signals = [
        { label: 'Torre Chapinero', value: '+12.5%', positive: true },
        { label: 'Índice Inmobiliario BOG', value: '+8.2%', positive: true },
        { label: 'USD/COP', value: '-0.3%', positive: false },
        { label: 'Sector Tech Colombiano', value: '+15.1%', positive: true }
    ];
    
    const marketSignals = document.getElementById('marketSignals');
    if (!marketSignals) return;
    
    marketSignals.innerHTML = signals.map(signal => `
        <div class="market-signal">
            <div class="signal-info">
                <div class="signal-label">${signal.label}</div>
                <div class="signal-timestamp">Actualizado: hace ${Math.floor(Math.random() * 60)} min</div>
            </div>
            <div class="signal-value ${signal.positive ? 'positive' : 'negative'}">
                ${signal.value}
            </div>
        </div>
    `).join('');
}

// KYC Functions
function uploadKYCDocument() {
    showNotification('📄 Funcionalidad de carga de documentos en desarrollo', 'info');
}

function retryKYC() {
    showNotification('🔄 Reiniciando proceso de verificación...', 'info');
    currentUser.kycStatus = 'pending';
    updateKYCStatus();
}

// Activity Feed (Future feature)
function generateActivityFeed() {
    // Sample activities
    const activities = [
        {
            type: 'investment',
            title: 'Nueva Inversión',
            description: 'Invertiste 8 tokens en Torre Empresarial Chapinero',
            timestamp: '2024-03-15T10:30:00Z'
        },
        {
            type: 'vote',
            title: 'Voto Registrado',
            description: 'Votaste a favor de la liquidación anticipada',
            timestamp: '2024-03-14T15:45:00Z'
        },
        {
            type: 'transfer',
            title: 'Transferencia Recibida',
            description: 'Recibiste 2 tokens de juan@ejemplo.com',
            timestamp: '2024-03-13T09:20:00Z'
        }
    ];
    
    return activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                ${getActivityIcon(activity.type)}
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-timestamp">${formatTimestamp(activity.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    switch (type) {
        case 'investment': return '💰';
        case 'vote': return '🗳️';
        case 'transfer': return '📤';
        default: return '📋';
    }
}

// Portfolio Analytics
function calculatePortfolioStats() {
    if (userInvestments.length === 0) {
        return {
            totalInvested: 0,
            currentValue: 0,
            totalGain: 0,
            gainPercentage: 0,
            topPerformer: null
        };
    }
    
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const currentValue = userInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalGain = currentValue - totalInvested;
    const gainPercentage = (totalGain / totalInvested) * 100;
    
    const topPerformer = userInvestments.reduce((top, inv) => {
        const gain = ((inv.currentValue - inv.investedAmount) / inv.investedAmount) * 100;
        const topGain = top ? ((top.currentValue - top.investedAmount) / top.investedAmount) * 100 : -Infinity;
        return gain > topGain ? inv : top;
    }, null);
    
    return {
        totalInvested,
        currentValue,
        totalGain,
        gainPercentage: gainPercentage.toFixed(2),
        topPerformer
    };
}

function updatePortfolioStats() {
    const stats = calculatePortfolioStats();
    
    // Update stats cards if they exist
    const statsContainer = document.getElementById('portfolioStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card-dashboard">
                <div class="stat-number">${stats.totalInvested.toLocaleString()}</div>
                <div class="stat-label">Total Invertido</div>
            </div>
            <div class="stat-card-dashboard">
                <div class="stat-number">${stats.currentValue.toLocaleString()}</div>
                <div class="stat-label">Valor Actual</div>
            </div>
            <div class="stat-card-dashboard">
                <div class="stat-number ${stats.totalGain >= 0 ? 'positive' : 'negative'}">
                    ${stats.totalGain >= 0 ? '+' : ''}${stats.totalGain.toLocaleString()}
                </div>
                <div class="stat-label">Ganancia Total</div>
            </div>
            <div class="stat-card-dashboard">
                <div class="stat-number ${stats.gainPercentage >= 0 ? 'positive' : 'negative'}">
                    ${stats.gainPercentage >= 0 ? '+' : ''}${stats.gainPercentage}%
                </div>
                <div class="stat-label">Rendimiento</div>
            </div>
        </div>
    `;
}

// Market Data Simulation
function simulateMarketUpdates() {
    setInterval(() => {
        // Update investment values randomly (simulate market fluctuations)
        userInvestments.forEach(investment => {
            const volatility = 0.02; // 2% max daily change
            const change = (Math.random() - 0.5) * 2 * volatility;
            const newValue = investment.currentValue * (1 + change);
            
            // Ensure value doesn't go below 50% of invested amount
            investment.currentValue = Math.max(newValue, investment.investedAmount * 0.5);
        });
        
        // Update dashboard if visible
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection && dashboardSection.classList.contains('active')) {
            updatePortfolioValue();
            updatePortfolioList();
            updateMarketSignals();
        }
    }, 30000); // Update every 30 seconds
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
        return `hace ${diffMins} min`;
    } else if (diffHours < 24) {
        return `hace ${diffHours}h`;
    } else {
        return `hace ${diffDays}d`;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize market simulation when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Start market simulation
    simulateMarketUpdates();
});

// Export functions for global access
window.updateDashboard = updateDashboard;
window.openTransferModal = openTransferModal;
window.vote = vote;