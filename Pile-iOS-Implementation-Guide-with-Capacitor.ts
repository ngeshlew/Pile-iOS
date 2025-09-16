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
