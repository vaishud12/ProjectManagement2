// src/hooks/useEncryption.js
import { useCallback } from "react";
import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../config/config"; // Import the secret key from config

// Ensure SECRET_KEY is defined
if (!SECRET_KEY) {
  console.error("SECRET_KEY is not defined in the configuration file.");
}

const useEncryption = () => {
  // Encrypt data using AES
  const encryptData = useCallback((data) => {
    try {
      if (!SECRET_KEY) {
        throw new Error("Encryption failed: SECRET_KEY is missing.");
      }
      return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    } catch (error) {
      console.error("Encryption error:", error.message);
      return null;
    }
  }, []);

  // Decrypt data using AES
  const decryptData = useCallback((cipherText) => {
    try {
      if (!SECRET_KEY) {
        throw new Error("Decryption failed: SECRET_KEY is missing.");
      }
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Decryption error:", error.message);
      return null;
    }
  }, []);

  return { encryptData, decryptData };
};

export default useEncryption;
