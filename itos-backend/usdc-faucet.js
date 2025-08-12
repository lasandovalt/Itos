import { ethers } from "ethers";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// ABI simplificado de USDC con solo la función faucet
const USDC_ABI = [
    "function faucet(uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)"
];

async function main() {
    try {
        // Conectar al nodo Sepolia
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

        // Crear wallet desde clave privada
        const wallet = new ethers.Wallet(process.env.ITOS_PRIVATE_KEY, provider);

        // Instanciar contrato USDC
        const usdc = new ethers.Contract(process.env.USDC_ADDRESS, USDC_ABI, wallet);

        // Consultar balance antes
        let balanceBefore = await usdc.balanceOf(wallet.address);
        console.log("💰 Balance USDC antes:", ethers.formatUnits(balanceBefore, 6), "USDC");

        // Pedir 1000 USDC de prueba (tiene 6 decimales)
        const amount = ethers.parseUnits("1000", 6);
        console.log("🚰 Solicitando", ethers.formatUnits(amount, 6), "USDC del faucet...");

        const tx = await usdc.faucet(amount);
        await tx.wait();

        console.log("✅ Faucet ejecutado. Tx hash:", tx.hash);

        // Consultar balance después
        let balanceAfter = await usdc.balanceOf(wallet.address);
        console.log("💰 Balance USDC después:", ethers.formatUnits(balanceAfter, 6), "USDC");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
