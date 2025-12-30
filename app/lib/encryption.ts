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
        const decoded = atob(encryptedData); // Base64 decode
        const decrypted = xorDecrypt(decoded, SECRET_KEY);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

export function setEncryptedItem(key: string, value: any): void {
    const encrypted = encryptData(value);
    localStorage.setItem(key, encrypted);
}

export function getEncryptedItem(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decryptData(encrypted);
}

export function removeEncryptedItem(key: string): void {
    localStorage.removeItem(key);
}
