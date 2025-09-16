/*
 Pile iOS Implementation Guide with Capacitor + Ionic
 ---------------------------------------------------
 This file contains executable templates, commands, and code scaffolds to convert
 the Pile desktop React app into an iOS app using Capacitor + Ionic with
 maximum code reuse. Copy the snippets to your project as indicated.

 Contents
 - projectSetupCommands: Shell commands to install and configure Capacitor + Ionic
 - packageJsonAdditions: Recommended scripts and dependencies
 - capacitorConfigTs: Capacitor configuration template
 - storageAdapterTs: Electron fs -> Capacitor Filesystem adapter
 - keychainServiceTs: Secure storage for API keys + optional biometrics
 - zustandStoreTs: App state with persistence using the storage adapter
 - ionicAppShellTsx: iOS-optimized app shell with Ionic React
 - iosThemeCss: iOS styling, safe areas, and system UI tweaks
 - pluginBootstrapTs: Initialization for Capacitor plugins (haptics, status bar, etc.)
 - buildAndDeploy: Commands for building, signing, and deploying via Xcode/Fastlane
*/

export const projectSetupCommands = `#!/usr/bin/env bash
set -euo pipefail

# 0) From your existing React app root
# If starting fresh, you can bootstrap Ionic React first:
# npm create @ionic/react@latest pile-ios -- --no-interactive --template react

# 1) Install Capacitor core and CLI
npm install --save @capacitor/core @capacitor/app @capacitor/device @capacitor/keyboard @capacitor/haptics @capacitor/share @capacitor/status-bar @capacitor/filesystem @capacitor/preferences
npm install --save-dev @capacitor/cli

# 2) Optional but recommended: Ionic React UI shell
npm install --save @ionic/react @ionic/react-router ionicons

# 3) Secure storage + biometrics (community, well-maintained)
npm install --save @capawesome/capacitor-secure-storage @robingenz/capacitor-fingerprint-auth

# 4) Initialize Capacitor (creates capacitor.config.ts if missing)
npx cap init Pile com.pile.app --web-dir=build --npm-client=npm --yes

# 5) Add iOS platform
npx cap add ios

# 6) Build web and sync to native projects
npm run build
npx cap sync

# 7) Open Xcode to configure signing
npx cap open ios
`;

export const packageJsonAdditions = `{
  "scripts": {
    "cap:sync": "npx cap sync",
    "cap:ios": "npx cap open ios",
    "ios:build": "npm run build && npx cap copy ios && npx cap sync ios",
    "ios:run:device": "npm run ios:build && npx cap run ios --target=auto",
    "ios:run:sim": "npm run ios:build && npx cap run ios -l --external",
    "ios:signassets": "node ./scripts/generate-ios-icons-splashes.cjs",
    "ios:open": "npx cap open ios",
    "build:ios": "npm run build && npx cap sync ios"
  },
  "capacitornative": {
    "iosDeploymentTarget": "13.0"
  },
  "resolutions": {}
}`;

export const capacitorConfigTs = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pile.app',
  appName: 'Pile',
  webDir: 'build',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsLinkPreview: true,
    backgroundColor: '#ffffff',
    limitsNavigationsToAppBoundDomains: true,
  },
  server: {
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;`;

export const storageAdapterTs = `// src/storage/CapacitorStorageAdapter.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export type FileWriteOptions = {
  encoding?: 'utf8' | 'base64';
  recursive?: boolean;
};

export type FileReadOptions = {
  encoding?: 'utf8' | 'base64';
};

export type StatInfo = {
  type: 'file' | 'directory' | 'unknown';
  size: number;
  mtime?: number;
};

function normalize(path: string): string {
  return path.replace(/\\\\/g, '/').replace(/\+/g, '/');
}

function join(...parts: string[]): string {
  return normalize(parts.join('/'))
    .replace(/\/\/+/, '/')
    .replace(/\/\.$/, '')
    .replace(/\/\.\//g, '/');
}

export class CapacitorStorageAdapter {
  private readonly baseDir: Directory = Directory.Data;

  async readFile(path: string, options: FileReadOptions = {}): Promise<string | Uint8Array> {
    const res = await Filesystem.readFile({
      path: normalize(path),
      directory: this.baseDir,
      encoding: options.encoding === 'utf8' ? Encoding.UTF8 : undefined,
    });
    if (options.encoding === 'utf8') return res.data as string;
    // Capacitor returns base64 for binary; convert to Uint8Array
    const base64 = res.data as string;
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    return buffer;
  }

  async writeFile(path: string, data: string | Uint8Array, options: FileWriteOptions = {}): Promise<void> {
    const normalizedPath = normalize(path);
    const encoding = options.encoding === 'utf8' ? Encoding.UTF8 : undefined;
    let payload: string;
    if (typeof data === 'string') {
      payload = data;
    } else {
      // Convert binary to base64 for Capacitor
      let binary = '';
      data.forEach((b) => (binary += String.fromCharCode(b)));
      payload = btoa(binary);
    }
    try {
      await Filesystem.writeFile({ path: normalizedPath, directory: this.baseDir, data: payload, encoding, recursive: options.recursive ?? true });
    } catch (err: any) {
      if (String(err).includes('No such file or directory')) {
        const dir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
        if (dir) await this.mkdir(dir, { recursive: true });
        await Filesystem.writeFile({ path: normalizedPath, directory: this.baseDir, data: payload, encoding, recursive: true });
        return;
      }
      throw err;
    }
  }

  async mkdir(path: string, opts: { recursive?: boolean } = {}): Promise<void> {
    await Filesystem.mkdir({ path: normalize(path), directory: this.baseDir, recursive: opts.recursive ?? true });
  }

  async readdir(path: string): Promise<string[]> {
    const res = await Filesystem.readdir({ path: normalize(path), directory: this.baseDir });
    return res.files.map((f) => (typeof f === 'string' ? f : f.name));
  }

  async exists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({ path: normalize(path), directory: this.baseDir });
      return true;
    } catch {
      return false;
    }
  }

  async stat(path: string): Promise<StatInfo> {
    const res = await Filesystem.stat({ path: normalize(path), directory: this.baseDir });
    // Capacitor's type can be 'file' | 'directory'
    return { type: (res.type as 'file' | 'directory') ?? 'unknown', size: res.size ?? 0, mtime: res.mtime };
  }

  async rm(path: string, opts: { recursive?: boolean } = {}): Promise<void> {
    // Try delete file, if it fails try delete directory
    try {
      await Filesystem.deleteFile({ path: normalize(path), directory: this.baseDir });
    } catch {
      try {
        await Filesystem.rmdir({ path: normalize(path), directory: this.baseDir, recursive: opts.recursive ?? true });
      } catch {}
    }
  }

  resolve(...segments: string[]): string {
    return join(...segments);
  }
}

export const storage = new CapacitorStorageAdapter();
`;

export const keychainServiceTs = `// src/secure/KeychainService.ts
import { SecureStorage } from '@capawesome/capacitor-secure-storage';
import { FingerprintAuth } from '@robingenz/capacitor-fingerprint-auth';

export type SecretScope = 'api' | 'session' | 'userprefs';

function scopeKey(scope: SecretScope, key: string): string {
  return \
    'pile:' + scope + ':' + key;
}

export class KeychainService {
  async isBiometricsAvailable(): Promise<boolean> {
    try {
      const res = await FingerprintAuth.isAvailable();
      return res.has || false;
    } catch {
      return false;
    }
  }

  async setSecret(key: string, value: string, scope: SecretScope = 'api', requireBiometrics = false): Promise<void> {
    const itemKey = scopeKey(scope, key);
    if (requireBiometrics && (await this.isBiometricsAvailable())) {
      await FingerprintAuth.verify({ reason: 'Unlock Pile secrets' });
    }
    await SecureStorage.set({ key: itemKey, value });
  }

  async getSecret(key: string, scope: SecretScope = 'api', requireBiometrics = false): Promise<string | null> {
    const itemKey = scopeKey(scope, key);
    if (requireBiometrics && (await this.isBiometricsAvailable())) {
      await FingerprintAuth.verify({ reason: 'Access secure data' });
    }
    try {
      const res = await SecureStorage.get({ key: itemKey });
      return res.value ?? null;
    } catch {
      return null;
    }
  }

  async deleteSecret(key: string, scope: SecretScope = 'api'): Promise<void> {
    try {
      await SecureStorage.remove({ key: scopeKey(scope, key) });
    } catch {}
  }
}

export const keychain = new KeychainService();
`;

export const zustandStoreTs = `// src/state/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../storage/CapacitorStorageAdapter';

export type Item = {
  id: string;
  title: string;
  createdAt: number;
  content: string;
};

type AppState = {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
};

// Custom storage provider backed by Capacitor Filesystem
const fsStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    try {
      const exists = await storage.exists(name + '.json');
      if (!exists) return null;
      const data = (await storage.readFile(name + '.json', { encoding: 'utf8' })) as string;
      return data;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    await storage.writeFile(name + '.json', value, { encoding: 'utf8', recursive: true });
  },
  removeItem: async (name: string) => {
    await storage.rm(name + '.json');
  },
}));

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateItem: (id, patch) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
    }),
    {
      name: 'pile-state',
      storage: fsStorage,
      partialize: (s) => ({ items: s.items }),
    }
  )
);
`;

export const ionicAppShellTsx = `// src/App.tsx
import React from 'react';
import { IonApp, IonContent, IonHeader, IonTitle, IonToolbar, IonReactRouter, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';
import './styles/app.css';

setupIonicReact({ mode: 'ios' });

const Home = React.lazy(() => import('./screens/Home'));

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/home" render={() => (
            <>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Pile</IonTitle>
                </IonToolbar>
              </IonHeader>
              <IonContent fullscreen className="ion-padding">
                <React.Suspense fallback={<div />}> 
                  <Home />
                </React.Suspense>
              </IonContent>
            </>
          )} exact />
          <Redirect exact from="/" to="/home" />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export async function impact() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}
`;

export const iosThemeCss = `/* src/theme/variables.css */
:root {
  --ion-color-primary: #0d6efd;
  --ion-color-primary-contrast: #ffffff;
  --ion-background-color: #ffffff;
  --ion-text-color: #0f1623;
}

/* Respect safe areas */
ion-content::part(scroll) {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Smooth scrolling and momentum */
html, body, ion-content {
  -webkit-overflow-scrolling: touch;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --ion-color-primary: #428cff;
    --ion-color-primary-contrast: #ffffff;
    --ion-background-color: #1e1e1e;
    --ion-text-color: #ffffff;
  }
}
`;

export const pluginBootstrapTs = `// src/platform/ios/bootstrap.ts
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export async function bootstrapIOS(): Promise<void> {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {}

  Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {});

  App.addListener('appStateChange', ({ isActive }) => {
    // Add analytics/resume handling as needed
    if (isActive) {
      // resume
    } else {
      // background
    }
  });
}
`;

export const buildAndDeploy = `# Build and deploy notes

## Manual via Xcode
1. npm run ios:build
2. npx cap open ios
3. In Xcode: set Team, Bundle Identifier, Signing & Capabilities.
4. Product > Archive > Distribute App > App Store Connect or TestFlight.

## Fastlane (optional)
Fastfile template (place in ios/Fastfile):

lane :beta do
  build_app(
    scheme: "App",
    export_method: "app-store"
  )
  upload_to_testflight(
    skip_waiting_for_build_processing: true
  )
end

lane :release do
  build_app(
    scheme: "App",
    export_method: "app-store"
  )
  upload_to_app_store(
    submit_for_review: false
  )
end
`;

export const migrationNotes = `Migration Guide from Electron to Capacitor
----------------------------------------------------------------
1) Replace Node/Electron fs calls with CapacitorStorageAdapter
   - fs.readFile -> storage.readFile('path', { encoding: 'utf8' })
   - fs.writeFile -> storage.writeFile('path', data, { encoding: 'utf8' })
   - fs.mkdir/readdir/stat/unlink -> adapter equivalents

2) Replace IPC invocations with direct service calls or Capacitor plugins
   - window.electron.ipcRenderer.invoke('openExternal', url) -> window.open(url, '_system') or InAppBrowser plugin as needed
   - Native dialogs -> use Ionic modals/toasts or community plugins

3) Environment and secrets
   - Do not ship production OpenAI keys in the bundle.
   - Use KeychainService for end-user keys; require biometrics for read access if desired.

4) Navigation and windows
   - Replace Electron windows with Ionic routes and modals.
   - Use split-pane for iPad large-screen layouts.

5) Performance
   - Enable code splitting; lazy-load heavy routes.
   - Virtualize large lists; avoid layout thrashing; use CSS containment where possible.

6) Offline
   - Persist essential data via Filesystem (Directory.Data) and a small in-memory cache.
   - Implement background sync on app resume.
`;

export default {
  projectSetupCommands,
  packageJsonAdditions,
  capacitorConfigTs,
  storageAdapterTs,
  keychainServiceTs,
  zustandStoreTs,
  ionicAppShellTsx,
  iosThemeCss,
  pluginBootstrapTs,
  buildAndDeploy,
  migrationNotes,
};

// ===================================================
// PILE iOS CONVERSION - IMPLEMENTATION GUIDE
// ===================================================

// 1. PROJECT SETUP
// ===================================================

// package.json - Updated dependencies for Capacitor
{
  "name": "pile-ios",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    // React Core
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    
    // Capacitor Core
    "@capacitor/core": "^5.0.0",
    "@capacitor/ios": "^5.0.0",
    "@capacitor/app": "^5.0.0",
    "@capacitor/filesystem": "^5.0.0",
    "@capacitor/preferences": "^5.0.0",
    "@capacitor/keyboard": "^5.0.0",
    "@capacitor/status-bar": "^5.0.0",
    "@capacitor/haptics": "^5.0.0",
    
    // UI Components
    "@ionic/react": "^7.0.0",
    "@ionic/react-router": "^7.0.0",
    
    // Utilities
    "date-fns": "^2.29.0",
    "uuid": "^9.0.0",
    "dompurify": "^3.0.0",
    
    // Rich Text Editor
    "@tiptap/react": "^2.0.0",
    "@tiptap/starter-kit": "^2.0.0",
    
    // State Management
    "zustand": "^4.3.0",
    
    // OpenAI
    "openai": "^4.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "ios": "npm run build && npx cap sync ios && npx cap open ios",
    "sync": "npx cap sync",
    "build:ios": "npm run build && npx cap sync ios"
  }
}

// 2. CAPACITOR CONFIGURATION
// ===================================================

// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.udara.pile',
  appName: 'Pile',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;

// 3. STORAGE ADAPTER - Bridge between Electron FS and Capacitor
// ===================================================

// src/services/storage/StorageAdapter.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  thread?: string;
  highlighted?: boolean;
  reflections?: string[];
}

export class StorageAdapter {
  private readonly ENTRIES_DIR = 'pile-entries';
  
  // Initialize storage directories
  async initialize(): Promise<void> {
    try {
      await Filesystem.mkdir({
        path: this.ENTRIES_DIR,
        directory: Directory.Documents,
        recursive: true
      });
    } catch (error) {
      // Directory might already exist
      console.log('Storage initialized');
    }
  }
  
  // Save journal entry
  async saveEntry(entry: JournalEntry): Promise<void> {
    const filename = `${entry.id}.json`;
    await Filesystem.writeFile({
      path: `${this.ENTRIES_DIR}/${filename}`,
      data: JSON.stringify(entry),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
  }
  
  // Load all entries
  async loadEntries(): Promise<JournalEntry[]> {
    try {
      const files = await Filesystem.readdir({
        path: this.ENTRIES_DIR,
        directory: Directory.Documents
      });
      
      const entries = await Promise.all(
        files.files
          .filter(file => file.name.endsWith('.json'))
          .map(async (file) => {
            const content = await Filesystem.readFile({
              path: `${this.ENTRIES_DIR}/${file.name}`,
              directory: Directory.Documents,
              encoding: Encoding.UTF8
            });
            return JSON.parse(content.data as string);
          })
      );
      
      return entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    }
  }
  
  // Delete entry
  async deleteEntry(id: string): Promise<void> {
    await Filesystem.deleteFile({
      path: `${this.ENTRIES_DIR}/${id}.json`,
      directory: Directory.Documents
    });
  }
  
  // Save preferences (settings, API keys, etc.)
  async savePreference(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value)
    });
  }
  
  // Load preference
  async getPreference(key: string): Promise<any> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  }
  
  // Export all data
  async exportData(): Promise<string> {
    const entries = await this.loadEntries();
    const preferences = await this.getAllPreferences();
    
    return JSON.stringify({
      entries,
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }
  
  // Import data
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Import entries
    for (const entry of data.entries) {
      await this.saveEntry(entry);
    }
    
    // Import preferences
    for (const [key, value] of Object.entries(data.preferences)) {
      await this.savePreference(key, value);
    }
  }
  
  private async getAllPreferences(): Promise<Record<string, any>> {
    const { keys } = await Preferences.keys();
    const preferences: Record<string, any> = {};
    
    for (const key of keys) {
      preferences[key] = await this.getPreference(key);
    }
    
    return preferences;
  }
}

// 4. MAIN APP COMPONENT - iOS Optimized
// ===================================================

// src/App.tsx
import React, { useEffect, useState } from 'react';
import { IonApp, IonContent, IonHeader, IonToolbar, IonTitle, setupIonicReact } from '@ionic/react';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';
import { StorageAdapter } from './services/storage/StorageAdapter';
import { JournalView } from './components/JournalView';
import { useStore } from './store/journalStore';

// Ionic CSS
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './styles/variables.css';
import './styles/app.css';

setupIonicReact({
  mode: 'ios', // Force iOS styling
  swipeBackEnabled: true,
  hardwareBackButton: true
});

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const storage = new StorageAdapter();
  const { loadEntries, setStorage } = useStore();
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    // Set status bar
    await StatusBar.setStyle({ style: 'Dark' });
    
    // Initialize storage
    await storage.initialize();
    setStorage(storage);
    
    // Load existing entries
    const entries = await storage.loadEntries();
    loadEntries(entries);
    
    // Set up keyboard listeners
    Keyboard.addListener('keyboardWillShow', info => {
      console.log('Keyboard height:', info.keyboardHeight);
    });
    
    // Handle app state changes
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        // Save any pending changes when app goes to background
        savePendingChanges();
      }
    });
    
    setInitialized(true);
  };
  
  const savePendingChanges = async () => {
    // Implement auto-save logic
    console.log('Saving pending changes...');
  };
  
  if (!initialized) {
    return (
      <IonApp>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <h2>Loading Pile...</h2>
          </div>
        </IonContent>
      </IonApp>
    );
  }
  
  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <JournalView />
      </IonContent>
    </IonApp>
  );
};

export default App;

// 5. JOURNAL STORE - State Management
// ===================================================

// src/store/journalStore.ts
import { create } from 'zustand';
import { JournalEntry, StorageAdapter } from '../services/storage/StorageAdapter';

interface JournalState {
  entries: JournalEntry[];
  currentThread: string | null;
  searchQuery: string;
  storage: StorageAdapter | null;
  
  // Actions
  setStorage: (storage: StorageAdapter) => void;
  loadEntries: (entries: JournalEntry[]) => void;
  addEntry: (content: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  setCurrentThread: (thread: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<JournalState>((set, get) => ({
  entries: [],
  currentThread: null,
  searchQuery: '',
  storage: null,
  
  setStorage: (storage) => set({ storage }),
  
  loadEntries: (entries) => set({ entries }),
  
  addEntry: async (content) => {
    const { storage, entries } = get();
    if (!storage) return;
    
    const newEntry: JournalEntry = {
      id: generateId(),
      content,
      timestamp: new Date(),
      thread: get().currentThread || undefined,
      highlighted: false,
      reflections: []
    };
    
    await storage.saveEntry(newEntry);
    set({ entries: [newEntry, ...entries] });
  },
  
  deleteEntry: async (id) => {
    const { storage, entries } = get();
    if (!storage) return;
    
    await storage.deleteEntry(id);
    set({ entries: entries.filter(e => e.id !== id) });
  },
  
  updateEntry: async (id, updates) => {
    const { storage, entries } = get();
    if (!storage) return;
    
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    const updatedEntry = { ...entry, ...updates };
    await storage.saveEntry(updatedEntry);
    
    set({
      entries: entries.map(e => e.id === id ? updatedEntry : e)
    });
  },
  
  setCurrentThread: (thread) => set({ currentThread: thread }),
  
  setSearchQuery: (query) => set({ searchQuery: query })
}));

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 6. JOURNAL VIEW COMPONENT
// ===================================================

// src/components/JournalView.tsx
import React, { useState } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonFab,
  IonFabButton,
  isPlatform
} from '@ionic/react';
import { trash, star, starOutline, add } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useStore } from '../store/journalStore';
import { format } from 'date-fns';

export const JournalView: React.FC = () => {
  const [newEntry, setNewEntry] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const { entries, addEntry, deleteEntry, updateEntry, searchQuery, setSearchQuery } = useStore();
  
  const handleAddEntry = async () => {
    if (newEntry.trim()) {
      await addEntry(newEntry);
      setNewEntry('');
      setIsComposing(false);
      
      // Haptic feedback on iOS
      if (isPlatform('ios')) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    }
  };
  
  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    await Haptics.impact({ style: ImpactStyle.Medium });
  };
  
  const toggleHighlight = async (entry: JournalEntry) => {
    await updateEntry(entry.id, { highlighted: !entry.highlighted });
    await Haptics.impact({ style: ImpactStyle.Light });
  };
  
  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="journal-container">
      <IonSearchbar
        value={searchQuery}
        onIonInput={(e) => setSearchQuery(e.detail.value!)}
        placeholder="Search entries..."
        showClearButton="focus"
      />
      
      {isComposing && (
        <IonCard>
          <IonCardContent>
            <IonTextarea
              value={newEntry}
              onIonInput={(e) => setNewEntry(e.detail.value!)}
              placeholder="What's on your mind?"
              autoGrow
              rows={4}
              autoFocus
            />
            <div className="compose-actions">
              <IonButton 
                fill="clear" 
                onClick={() => {
                  setIsComposing(false);
                  setNewEntry('');
                }}
              >
                Cancel
              </IonButton>
              <IonButton onClick={handleAddEntry}>
                Save Entry
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      )}
      
      <IonList>
        {filteredEntries.map((entry) => (
          <IonItemSliding key={entry.id}>
            <IonItem lines="none">
              <div className="entry-content" slot="start">
                <IonButton
                  fill="clear"
                  onClick={() => toggleHighlight(entry)}
                >
                  <IonIcon 
                    icon={entry.highlighted ? star : starOutline}
                    color={entry.highlighted ? "warning" : "medium"}
                  />
                </IonButton>
              </div>
              <IonLabel>
                <h3>{format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}</h3>
                <p className="entry-text">{entry.content}</p>
                {entry.reflections && entry.reflections.length > 0 && (
                  <div className="reflections">
                    {entry.reflections.map((reflection, idx) => (
                      <p key={idx} className="reflection-text">
                        AI: {reflection}
                      </p>
                    ))}
                  </div>
                )}
              </IonLabel>
            </IonItem>
            
            <IonItemOptions side="end">
              <IonItemOption 
                color="danger" 
                onClick={() => handleDelete(entry.id)}
              >
                <IonIcon icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}
      </IonList>
      
      {!isComposing && (
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsComposing(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      )}
    </div>
  );
};

// 7. iOS-SPECIFIC STYLES
// ===================================================

// src/styles/app.css
.journal-container {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.entry-content {
  display: flex;
  align-items: flex-start;
  margin-right: 8px;
}

.entry-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  color: var(--ion-text-color);
  margin: 8px 0;
}

.reflection-text {
  font-style: italic;
  color: var(--ion-color-medium);
  background: var(--ion-color-light);
  padding: 8px;
  border-radius: 8px;
  margin-top: 8px;
}

.compose-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* iOS Safe Area */
@supports (padding: max(0px)) {
  .journal-container {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --ion-color-primary: #428cff;
    --ion-color-primary-contrast: #ffffff;
    --ion-background-color: #1e1e1e;
    --ion-text-color: #ffffff;
  }
}

// 8. BUILD AND DEPLOYMENT SCRIPT
// ===================================================

// scripts/deploy-ios.sh
#!/bin/bash

echo "Building Pile for iOS..."

# Clean previous builds
rm -rf build
rm -rf ios/App/App/public

# Build React app
npm run build

# Sync with Capacitor
npx cap sync ios

# Copy custom assets
cp -r assets/ios/* ios/App/App/Assets.xcassets/

# Open in Xcode
npx cap open ios

echo "iOS build ready! Opening Xcode..."
echo "Remember to:"
echo "1. Set your development team"
echo "2. Configure app capabilities"
echo "3. Test on simulator/device"
echo "4. Archive for App Store submission"
