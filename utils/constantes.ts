// utils/constants.ts
import type { Language, Translations } from '~/types'

export const MONETIZATION_URL = "https://cartpanda.com"; // Seu link aqui

export const DICTIONARY: Record<Language, Translations> = {
    en: {
        title: "X VIBE CHECK",
        subtitle: "Paste your tweets or bio. Get roasted by AI. No mercy.",
        placeholder: "Paste your recent tweets, bio, or rant here...",
        buttonRoast: "ROAST ME 🔥",
        buttonLoading: "JUDGING YOU...",
        monetizationCta: "UNLOCK YOUR FUTURE 🔮",
        monetizationDesc: "The AI has seen your dark timeline. Click to see what happens next.",
        shareTitle: "OFFICIAL VIBE CERTIFICATE",
        download: "DOWNLOAD CARD",
        error: "Failed to generate roast. You might be too boring for the AI.",
        statsTitle: "VIBE METRICS",
    },
    pt: {
        title: "X VIBE CHECK",
        subtitle: "Cole seus tweets ou bio. Seja julgado pela IA. Sem piedade.",
        placeholder: "Cole seus tweets recentes, bio ou desabafos aqui...",
        buttonRoast: "ME JULGUE 🔥",
        buttonLoading: "JULGANDO...",
        monetizationCta: "VER PREVISÃO DO FUTURO 🔮",
        monetizationDesc: "A IA viu sua linha do tempo sombria. Clique para ver seu destino.",
        shareTitle: "CERTIFICADO DE VIBE OFICIAL",
        download: "BAIXAR CARD",
        error: "Falha ao gerar roast. Talvez você seja chato demais para a IA.",
        statsTitle: "MÉTRICAS DE VIBE",
    }
};