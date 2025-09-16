import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { Secure } from '../services/secure';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    Secure.getApiKey().then((key) => setApiKey(key || ''));
  }, []);

  const onSave = async () => {
    await Secure.setApiKey(apiKey.trim());
    Alert.alert('Saved', 'API key stored securely.');
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
    </View>
  );
}