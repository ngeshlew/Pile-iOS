import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, Switch } from 'react-native';
import { Secure } from '../services/secure';
import { Storage } from '../services/storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { AppLock } from '../services/appLock';
import { enableEncryption, clearEncryptionKey, isEncryptionEnabled } from '../services/encryption';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState<string>('');
  const [lockEnabled, setLockEnabled] = useState<boolean>(false);
  const [encEnabled, setEncEnabled] = useState<boolean>(false);

  useEffect(() => {
    Secure.getApiKey().then((key) => setApiKey(key || ''));
    AppLock.isEnabled().then(setLockEnabled);
    isEncryptionEnabled().then(setEncEnabled);
  }, []);

  const onSave = async () => {
    await Secure.setApiKey(apiKey.trim());
    Alert.alert('Saved', 'API key stored securely.');
  };

  const onExport = async () => {
    try {
      const { uri, count } = await Storage.exportAll();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: `Exported ${count} entries` });
      } else {
        Alert.alert('Exported', `Saved export file with ${count} entries at:\n${uri}`);
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Could not export data.');
    }
  };

  const onImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const { imported, skipped } = await Storage.importFrom(asset.uri);
      Alert.alert('Import complete', `Imported ${imported}, skipped ${skipped}.`);
    } catch (e: any) {
      Alert.alert('Import failed', e?.message || 'Could not import data.');
    }
  };

  const onToggleLock = async (value: boolean) => {
    setLockEnabled(value);
    await AppLock.setEnabled(value);
  };

  const onToggleEncryption = async (value: boolean) => {
    setEncEnabled(value);
    if (value) await enableEncryption();
    else await clearEncryptionKey();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: '600' }}>OpenAI API Key</Text>
      <TextInput
        placeholder="sk-..."
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
      />
      <Button title="Save" onPress={onSave} />

      <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 12 }} />

      <Text style={{ fontWeight: '600' }}>Privacy</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>App Lock (Face ID/Touch ID)</Text>
        <Switch value={lockEnabled} onValueChange={onToggleLock} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>At-rest Encryption (content)</Text>
        <Switch value={encEnabled} onValueChange={onToggleEncryption} />
      </View>

      <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 12 }} />

      <Text style={{ fontWeight: '600' }}>Data</Text>
      <Button title="Export entries" onPress={onExport} />
      <Button title="Import entries" onPress={onImport} />
    </View>
  );
}