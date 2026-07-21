import { prisma } from "../../lib/prisma.js";

export const SettingsService = {
  async getTaxSettings(storeId: string) {
    const config = await prisma.config.findUnique({
      where: { storeId },
    });
    
    // Defaulting to what might be in customFields or a 0% tax if not set
    const taxRate = config?.customFields ? (config.customFields as any).taxRate : 0;
    
    return {
      taxRate: taxRate || 0,
      currency: config?.currency || "BDT"
    };
  },

  async getBackupSettings(storeId: string) {
    // In a real scenario, this would query a cloud storage or cron jobs for backups
    return {
      lastBackup: new Date().toISOString(),
      autoBackupEnabled: true,
      backupFrequency: "daily"
    };
  },

  async getSecuritySettings(storeId: string) {
    // Return mock security settings for now (e.g., active sessions if available)
    return {
      twoFactorAuthEnabled: false,
      lastPasswordChange: new Date().toISOString(),
      activeSessions: 1
    };
  }
};
