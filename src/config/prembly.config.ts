import { env } from "./env.config";

export const premblyConfig = () => {
  return {
    baseURL: env.PREMBLY_BASE_URL,
    apikey: env.PREMBLY_API_KEY,
    appId: env.PREMBLY_APP_ID,
  };
};
