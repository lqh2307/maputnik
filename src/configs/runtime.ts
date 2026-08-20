export type RuntimeTokens = Partial<
  Record<"openmaptiles" | "thunderforest" | "locationiq" | "stadia", string>
>;

export type RuntimeConfig = {
  tokens?: RuntimeTokens;
};

declare global {
  interface Window {
    MAPUTNIK_CONFIG?: RuntimeConfig;
  }
}

export const runtimeConfig: RuntimeConfig = window.MAPUTNIK_CONFIG || {};
export const runtimeTokens: RuntimeTokens = runtimeConfig.tokens || {};
