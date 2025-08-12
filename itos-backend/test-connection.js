import { ethers } from "ethers";
import dotenv from "dotenv";

// Cargar variables de entorno del archivo .env
dotenv.config();

async function main() {
    try {
        // Conectar al nodo Sepolia usando la URL de Alchemy
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

        // Crear la wallet usando la clave privada de .env
        const wallet = new ethers.Wallet(process.env.ITOS_PRIVATE_KEY, provider);

        // Mostrar información básica
        console.log("✅ Conexión establecida con Sepolia");
        console.log("📄 Dirección de la wallet:", wallet.address);

        // Consultar balance de ETH
        const balance = await provider.getBalance(wallet.address);
        console.log("💰 Balance en ETH:", ethers.formatEther(balance));

    } catch (error) {
        console.error("❌ Error en la conexión:", error);
    }
}

main();