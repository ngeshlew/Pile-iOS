declare module 'expo-haptics' {
  export const selectionAsync: () => Promise<void>;
}

declare module 'expo-image-picker' {
  export type MediaTypeOptions = { All: string };
  export const MediaTypeOptions: MediaTypeOptions;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: 'granted' | 'denied' }>;
  export function launchImageLibraryAsync(options?: any): Promise<{ canceled: boolean; assets?: Array<{ uri: string }> }>;
}

declare module 'expo-av' {
  export namespace Audio {
    type RecordingOptionsPreset = any;
    const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: RecordingOptionsPreset;
    function requestPermissionsAsync(): Promise<{ status: 'granted' | 'denied' }>;
    function setAudioModeAsync(options: any): Promise<void>;
    class Recording {
      prepareToRecordAsync(options: any): Promise<void>;
      startAsync(): Promise<void>;
      stopAndUnloadAsync(): Promise<void>;
      getURI(): string | null;
    }
  }
}

declare module 'expo-document-picker' {
  export function getDocumentAsync(options?: any): Promise<{ canceled: boolean; assets?: Array<{ uri: string }> }>;
}

declare module 'expo-sharing' {
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(uri: string, options?: any): Promise<void>;
}

declare module 'expo-network' {
  export function getNetworkStateAsync(): Promise<{ isConnected?: boolean; isInternetReachable?: boolean }>;
}

declare module 'expo-local-authentication' {
  export function hasHardwareAsync(): Promise<boolean>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(options?: any): Promise<{ success: boolean }>;
}