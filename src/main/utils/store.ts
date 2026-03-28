import settings from 'electron-settings';
import { safeStorage } from 'electron';

if (!safeStorage.isEncryptionAvailable()) {
  throw new Error('Encryption is not available on this system.');
}

function getProviderKey(provider: string = 'openai') {
  return `${provider}AiKey`;
}

export async function getKey(provider: string = 'openai'): Promise<string | null> {
  try {
    let encryptedKey = await settings.get(getProviderKey(provider));
    if (!encryptedKey && provider === 'openai') {
      encryptedKey = await settings.get('aiKey');
    }
    if (!encryptedKey || typeof encryptedKey !== 'string') return null;
    return safeStorage.decryptString(Buffer.from(encryptedKey, 'base64'));
  } catch (error) {
    console.error('Error retrieving AI key:', error);
    return null;
  }
}

export async function setKey(
  secretKey: string,
  provider: string = 'openai'
): Promise<boolean> {
  try {
    const encryptedKey = safeStorage.encryptString(secretKey);
    await settings.set(getProviderKey(provider), encryptedKey.toString('base64'));
    return true;
  } catch (error) {
    console.error('Error setting AI key:', error);
    return false;
  }
}

export async function deleteKey(provider: string = 'openai'): Promise<boolean> {
  try {
    await settings.unset(getProviderKey(provider));
    if (provider === 'openai') {
      await settings.unset('aiKey');
    }
    return true;
  } catch (error) {
    console.error('Error deleting AI key:', error);
    return false;
  }
}
