import { ethers } from "ethers";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// ABI de USDC (solo approve y balance)
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
];

// ABI de Escrow (solo invest)
const ESCROW_ABI = [
    "function invest(uint256 usdcAmount) external",
    "function getInvestorInfo(address investor) external view returns (uint256,uint256,uint256,uint256,string)"
];

async function main() {
    try {
        // 1️⃣ Conexión a Sepolia
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.ITOS_PRIVATE_KEY, provider);

        // 2️⃣ Instanciar contratos
        const usdc = new ethers.Contract(process.env.USDC_ADDRESS, USDC_ABI, wallet);
        const escrow = new ethers.Contract(process.env.ESCROW_ADDRESS, ESCROW_ABI, wallet);

        // 3️⃣ Ver balance actual de USDC
        let balance = await usdc.balanceOf(wallet.address);
        console.log("💰 Balance USDC actual:", ethers.formatUnits(balance, 6));

        // 4️⃣ Monto a invertir (en USDC)
        const investAmount = ethers.parseUnits("100", 6); // invertir 500 USDC
        console.log("📤 Invirtiendo:", ethers.formatUnits(investAmount, 6), "USDC");

        // 5️⃣ Aprobar gasto
        console.log("🔐 Aprobando gasto...");
        const approveTx = await usdc.approve(process.env.ESCROW_ADDRESS, investAmount);
        await approveTx.wait();
        console.log("✅ Aprobación confirmada. Tx hash:", approveTx.hash);

        // 6️⃣ Ejecutar inversión
        console.log("🚀 Ejecutando inversión en Escrow...");
        const investTx = await escrow.invest(investAmount);
        await investTx.wait();
        console.log("✅ Inversión ejecutada. Tx hash:", investTx.hash);

        // 7️⃣ Consultar información del inversor
        const investorInfo = await escrow.getInvestorInfo(wallet.address);
        console.log("📊 Información de inversión:", investorInfo);

    } catch (error) {
        console.error("❌ Error en la inversión:", error);
    }
}

main();
