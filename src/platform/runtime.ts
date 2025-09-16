import { capStorage } from './adapters/capacitor/storage';
import { capSecrets } from './adapters/capacitor/secrets';
import { openAiClient } from './adapters/capacitor/ai';

export const storage = capStorage;
export const secrets = capSecrets;
export const ai = openAiClient(secrets);
