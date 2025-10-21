import AsyncStorage from '@react-native-async-storage/async-storage';

const VERSION_KEY = 'app_version';
const CURRENT_VERSION = '1.0.0-beta';
const BUILD_NUMBER = '1';

interface VersionInfo {
  version: string;
  buildNumber: string;
  lastChecked: string;
}

export async function getCurrentVersion(): Promise<VersionInfo> {
  return {
    version: CURRENT_VERSION,
    buildNumber: BUILD_NUMBER,
    lastChecked: new Date().toISOString(),
  };
}

export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
  updateUrl?: string;
  releaseNotes?: string;
}> {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('[VersionCheck] Checking for updates...');

    return {
      hasUpdate: false,
    };
  } catch (error) {
    console.error('[VersionCheck] Failed to check for updates:', error);
    return {
      hasUpdate: false,
    };
  }
}

export async function saveVersionInfo(versionInfo: VersionInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(VERSION_KEY, JSON.stringify(versionInfo));
    console.log('[VersionCheck] Version info saved:', versionInfo);
  } catch (error) {
    console.error('[VersionCheck] Failed to save version info:', error);
  }
}

export async function getStoredVersionInfo(): Promise<VersionInfo | null> {
  try {
    const stored = await AsyncStorage.getItem(VERSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[VersionCheck] Failed to get stored version info:', error);
    return null;
  }
}

export async function isFirstLaunch(): Promise<boolean> {
  const storedVersion = await getStoredVersionInfo();
  return storedVersion === null;
}

export async function isNewVersion(): Promise<boolean> {
  const storedVersion = await getStoredVersionInfo();
  if (!storedVersion) return false;

  return storedVersion.version !== CURRENT_VERSION;
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(p => parseInt(p.replace(/\D/g, ''), 10) || 0);
  const parts2 = v2.split('.').map(p => parseInt(p.replace(/\D/g, ''), 10) || 0);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}
