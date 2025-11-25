// types/index.ts
export type Language = 'en' | 'pt';

export interface RoastStats {
    cringeLevel: number;
    basedLevel: number;
    mainCharacterSyndrome: number;
    iq: number;
}

export interface RoastResult {
    archetype: string;
    shortBio: string;
    roastText: string;
    stats: RoastStats;
    weaknesses: string[];
    strengths: string[];
    verdict: string;
}

export interface Translations {
    title: string;
    subtitle: string;
    placeholder: string;
    buttonRoast: string;
    buttonLoading: string;
    monetizationCta: string;
    monetizationDesc: string;
    shareTitle: string;
    download: string;
    error: string;
    statsTitle: string;
}