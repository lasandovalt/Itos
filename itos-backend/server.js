import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ABIs
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
];
const ESCROW_ABI = [
    "function invest(uint256 usdcAmount) external",
    "function getInvestorInfo(address investor) external view returns (uint256,uint256,uint256,uint256,string)"
];

// Endpoint de inversión
app.post("/invest", async (req, res) => {
    try {
        const { amount } = req.body; // Monto en USDC desde el frontend

        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.ITOS_PRIVATE_KEY, provider);

        const usdc = new ethers.Contract(process.env.USDC_ADDRESS, USDC_ABI, wallet);
        const escrow = new ethers.Contract(process.env.ESCROW_ADDRESS, ESCROW_ABI, wallet);

        const investAmount = ethers.parseUnits(amount.toString(), 6);

        // Aprobar gasto
        const approveTx = await usdc.approve(process.env.ESCROW_ADDRESS, investAmount);
        await approveTx.wait();

        // Invertir
        const investTx = await escrow.invest(investAmount);
        await investTx.wait();

        // Obtener info
        const investorInfo = await escrow.getInvestorInfo(wallet.address);

        res.json({
            success: true,
            approveTx: approveTx.hash,
            investTx: investTx.hash,
            investorInfo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});
