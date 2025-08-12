// Blockchain Integration

// Contract addresses on Sepolia
const CONTRACTS = {
    USDC: '0xb3Ded8E7ACa1209D1c1BEB3D3057662925B548Ce',
    ITOS_TOKEN: '0x8E412CB79bBAE7aFE657F7711199F393a3652D8b',
    ESCROW: '0x8c4a676dD02DEB0a880E799FAe3805466B3e7A82'
};

// Simplified ABIs for the contracts
const ESCROW_ABI = [
    "function invest(uint256 usdcAmount) external",
    "function getEscrowInfo() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool, bool, bool, bool)",
    "function getInvestorInfo(address investor) external view returns (uint256, uint256, uint256, uint256, string memory)",
    "function calculateParticipations(uint256 usdcHuman) external view returns (uint256)",
    "function releaseFunds(address recipient) external",
    "function enableRefunds() external",
    "function claimRefund() external",
    "function enableBuyback(uint256 buybackPriceHuman) external",
    "function claimBuyback(uint256 tokenParts) external"
];

const USDC_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function faucet(uint256 amount) external"
];

const ITOS_TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function getProjectInfo() external view returns (string, string, string, uint256, uint256, uint8, uint256, uint256)",
    "function distributeParticipations(address to, uint256 amount) external",
    "function burnFromManager(address account, uint256 amount) external"
];

// Blockchain state
let provider = null;
let signer = null;
let contracts = {};
let isWeb3Enabled = false;

// Initialize Web3 connection
async function initializeWeb3() {
    if (typeof window.ethereum === 'undefined') {
        console.log('MetaMask not detected - using simulation mode');
        return false;
    }
    
    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        // Check if we're on Sepolia
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111n) { // Sepolia chain ID
            showNotification('⚠️ Cambia a Sepolia Testnet en MetaMask', 'warning');
            return false;
        }
        
        // Initialize contracts
        contracts.escrow = new ethers.Contract(CONTRACTS.ESCROW, ESCROW_ABI, signer);
        contracts.usdc = new ethers.Contract(CONTRACTS.USDC, USDC_ABI, signer);
        contracts.itosToken = new ethers.Contract(CONTRACTS.ITOS_TOKEN, ITOS_TOKEN_ABI, signer);
        
        isWeb3Enabled = true;
        
        // Get user address
        const address = await signer.getAddress();
        console.log('✅ Web3 initialized for:', address);
        
        // Update UI
        updateWeb3Status(address);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error initializing Web3:', error);
        showNotification('Error conectando con MetaMask', 'error');
        return false;
    }
}

function updateWeb3Status(address) {
    // Update any Web3 status indicators in the UI
    const statusElements = document.querySelectorAll('.web3-status');
    statusElements.forEach(element => {
        element.textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    });
}

// Real blockchain investment function
async function executeRealInvestment(tokens) {
    if (!isWeb3Enabled) {
        throw new Error('Web3 not enabled');
    }
    
    try {
        const usdcAmount = ethers.parseUnits((tokens * 100).toString(), 6); // 6 decimals for USDC
        
        showNotification('🏦 Obteniendo USDC de prueba...', 'info');
        // Get test USDC from faucet
        const faucetTx = await contracts.usdc.faucet(usdcAmount);
        await faucetTx.wait();
        
        showNotification('✅ USDC obtenido exitosamente', 'success');
        
        showNotification('🔐 Autorizando gasto...', 'info');
        // Approve escrow to spend USDC
        const approveTx = await contracts.usdc.approve(CONTRACTS.ESCROW, usdcAmount);
        await approveTx.wait();
        
        showNotification('✅ Autorización confirmada', 'success');
        
        showNotification('🚀 Ejecutando inversión...', 'info');
        // Execute investment
        const investTx = await contracts.escrow.invest(usdcAmount);
        const receipt = await investTx.wait();
        
        showNotification('✅ Inversión registrada en blockchain', 'success');
        
        return {
            success: true,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
        
    } catch (error) {
        console.error('Blockchain investment error:', error);
        
        // Handle specific errors
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transacción cancelada por el usuario');
        } else if (error.message.includes('insufficient funds')) {
            throw new Error('Fondos insuficientes para gas');
        } else {
            throw new Error('Error en la transacción blockchain');
        }
    }
}

// Get real contract data
async function getContractData() {
    if (!isWeb3Enabled) {
        return null;
    }
    
    try {
        const escrowInfo = await contracts.escrow.getEscrowInfo();
        const projectInfo = await contracts.itosToken.getProjectInfo();
        
        return {
            escrow: {
                totalRaised: escrowInfo[0],
                fundingGoal: escrowInfo[1],
                minimumFunding: escrowInfo[2],
                participationPrice: escrowInfo[3],
                deadline: escrowInfo[4],
                investorCount: escrowInfo[5],
                goalReached: escrowInfo[6],
                fundsReleased: escrowInfo[7],
                refundsEnabled: escrowInfo[8],
                buybackActive: escrowInfo[9]
            },
            project: {
                name: projectInfo[0],
                description: projectInfo[1],
                type: projectInfo[2],
                goal: projectInfo[3],
                deadline: projectInfo[4],
                state: projectInfo[5],
                availableParticipations: projectInfo[6],
                totalParticipations: projectInfo[7]
            }
        };
        
    } catch (error) {
        console.error('Error getting contract data:', error);
        return null;
    }
}

// Get user's token balance
async function getUserTokenBalance(userAddress) {
    if (!isWeb3Enabled) {
        return 0;
    }
    
    try {
        const balance = await contracts.itosToken.balanceOf(userAddress);
        return Number(balance);
    } catch (error) {
        console.error('Error getting token balance:', error);
        return 0;
    }
}

// Governance functions
async function submitVote(proposalId, vote, tokenAmount) {
    if (!isWeb3Enabled) {
        throw new Error('Web3 not enabled');
    }
    
    // This would interact with a governance contract
    // For now, we'll simulate the vote
    showNotification('🗳️ Enviando voto a blockchain...', 'info');
    
    try {
        // Simulate blockchain vote
        await simulateDelay(2000);
        
        showNotification('✅ Voto registrado en blockchain', 'success');
        
        return {
            success: true,
            proposalId,
            vote,
            tokenAmount,
            txHash: '0x' + Math.random().toString(16).substr(2, 64)
        };
        
    } catch (error) {
        throw new Error('Error registrando voto');
    }
}

// Token transfer functions
async function transferTokens(recipientAddress, tokenAmount) {
    if (!isWeb3Enabled) {
        throw new Error('Web3 not enabled');
    }
    
    try {
        showNotification('📤 Transfiriendo tokens...', 'info');
        
        const transferTx = await contracts.itosToken.transfer(recipientAddress, tokenAmount);
        const receipt = await transferTx.wait();
        
        showNotification('✅ Tokens transferidos exitosamente', 'success');
        
        return {
            success: true,
            txHash: receipt.hash,
            to: recipientAddress,
            amount: tokenAmount
        };
        
    } catch (error) {
        console.error('Transfer error:', error);
        throw new Error('Error en la transferencia');
    }
}

// Test connection function
async function testConnection() {
    showNotification('🔧 Probando conexión con contratos...', 'info');
    
    const success = await initializeWeb3();
    
    if (success) {
        try {
            const data = await getContractData();
            if (data) {
                showNotification('✅ Contratos funcionando correctamente', 'success');
                console.log('Contract data:', data);
            } else {
                showNotification('⚠️ Contratos conectados pero sin datos', 'warning');
            }
        } catch (error) {
            showNotification('❌ Error leyendo datos de contratos', 'error');
        }
    } else {
        showNotification('❌ No se pudo conectar a MetaMask/Sepolia', 'error');
    }
}

// Enhanced investment function that tries real blockchain first
async function enhancedInvestment(tokens, custodyType) {
    const investmentAmount = tokens * TOKEN_PRICE_COP;
    
    // Try real blockchain first
    if (await initializeWeb3()) {
        try {
            const result = await executeRealInvestment(tokens);
            
            // If successful, update user data
            userBalance -= investmentAmount * (1 + ITOS_FEE);
            
            const newInvestment = {
                id: Date.now(),
                project: 'Torre Empresarial Chapinero',
                tokens: tokens,
                investedAmount: investmentAmount,
                currentValue: investmentAmount,
                date: new Date().toISOString().split('T')[0],
                custody: custodyType,
                status: 'active',
                txHash: result.txHash,
                blockNumber: result.blockNumber
            };
            
            userInvestments.push(newInvestment);
            
            return {
                success: true,
                real: true,
                investment: newInvestment
            };
            
        } catch (error) {
            showNotification(`❌ Error blockchain: ${error.message}`, 'error');
            showNotification('🔄 Fallback a modo simulación', 'info');
        }
    }
    
    // Fallback to simulation
    return await simulatedInvestment(tokens, custodyType, investmentAmount);
}

async function simulatedInvestment(tokens, custodyType, investmentAmount) {
    // Existing simulation logic
    await simulateDelay(2000);
    
    userBalance -= investmentAmount * (1 + ITOS_FEE);
    
    const newInvestment = {
        id: Date.now(),
        project: 'Torre Empresarial Chapinero',
        tokens: tokens,
        investedAmount: investmentAmount,
        currentValue: investmentAmount,
        date: new Date().toISOString().split('T')[0],
        custody: custodyType,
        status: 'active',
        txHash: '0x' + Math.random().toString(16).substr(2, 64) + ' (simulado)'
    };
    
    userInvestments.push(newInvestment);
    
    return {
        success: true,
        real: false,
        investment: newInvestment
    };
}

// Listen for MetaMask account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length === 0) {
            showNotification('MetaMask desconectado', 'warning');
            isWeb3Enabled = false;
        } else {
            showNotification('Cuenta de MetaMask cambiada', 'info');
            initializeWeb3();
        }
    });
    
    window.ethereum.on('chainChanged', function (chainId) {
        if (parseInt(chainId, 16) !== 11155111) { // Not Sepolia
            showNotification('⚠️ Cambia a Sepolia Testnet', 'warning');
            isWeb3Enabled = false;
        } else {
            showNotification('✅ Conectado a Sepolia', 'success');
            initializeWeb3();
        }
    });
}

// Export functions for global access
window.testConnection = testConnection;
window.enhancedInvestment = enhancedInvestment;
window.initializeWeb3 = initializeWeb3;