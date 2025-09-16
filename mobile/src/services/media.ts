import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export async function pickMedia(): Promise<string[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return [];
  const res = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.9,
    selectionLimit: 10,
  });
  if (res.canceled) return [];
  const uris = res.assets?.map((a) => a.uri).filter(Boolean) || [];
  return uris;
}

export type RecordingHandle = {
  stop: () => Promise<string | null>;
};

export async function startRecording(): Promise<RecordingHandle | null> {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') return null;
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
  await recording.startAsync();
  return {
    async stop() {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        return uri || null;
      } catch {
        return null;
      }
    },
  };
}