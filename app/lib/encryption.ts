// Simple encryption/decryption for localStorage
// Uses base64 encoding with a simple XOR cipher
// For production, consider using crypto-js or similar

const SECRET_KEY = "intelligent-editor-2025-secure-key";

function xorEncrypt(text: string, key: string): string {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function xorDecrypt(encrypted: string, key: string): string {
    return xorEncrypt(encrypted, key); // XOR is symmetric
}

export function encryptData(data: any): string {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = xorEncrypt(jsonString, SECRET_KEY);
        return btoa(encrypted); // Base64 encode
    } catch (error) {
        console.error("Encryption failed:", error);
        return "";
    }
}

export function decryptData(encryptedData: string): any {
    try {
        if (!encryptedData) return null;
        const decoded = atob(encryptedData); // Base64 decode
        const decrypted = xorDecrypt(decoded, SECRET_KEY);
        return JSON.parse(decrypted);
    } catch (error) {
        // Silently return null for decryption errors (could be old unencrypted data)
        return null;
    }
}

export function setEncryptedItem(key: string, value: any): void {
    try {
        const encrypted = encryptData(value);
        if (encrypted) {
            localStorage.setItem(key, encrypted);
        }
    } catch (error) {
        console.error("Failed to save encrypted item:", error);
    }
}

export function getEncryptedItem(key: string): any {
    try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        // Try to decrypt
        const decrypted = decryptData(encrypted);
        if (decrypted !== null) {
            return decrypted;
        }

        // If decryption failed, it might be old plain JSON data
        // Try to parse it directly and re-save as encrypted
        try {
            const plainData = JSON.parse(encrypted);
            // Re-save as encrypted for next time
            setEncryptedItem(key, plainData);
            return plainData;
        } catch {
            // Not valid JSON either, remove corrupt data
            localStorage.removeItem(key);
            return null;
        }
    } catch (error) {
        // If all else fails, return null
        return null;
    }
}

export function removeEncryptedItem(key: string): void {
    localStorage.removeItem(key);
}
