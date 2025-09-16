import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Storage } from '../services/storage';
import { generateReflection } from '../services/ai';

type Props = NativeStackScreenProps<RootStackParamList, 'Compose'>;

export default function ComposeScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thinking, setThinking] = useState(false);

  const onSave = async () => {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      Alert.alert('Empty', 'Please write something before saving.');
      return;
    }
    await Storage.createPost({ title: title.trim() || undefined, content: trimmed });
    navigation.goBack();
  };

  const onReflect = async () => {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      Alert.alert('Empty', 'Write something first to reflect on.');
      return;
    }
    try {
      setThinking(true);
      const reflection = await generateReflection({ prompt: trimmed });
      setContent((prev) => `${prev}\n\nReflection:\n${reflection}`);
    } catch (e: any) {
      Alert.alert('AI Error', e?.message || 'Failed to generate reflection.');
    } finally {
      setThinking(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Title (optional)"
        value={title}
        onChangeText={setTitle}
        style={{ fontSize: 18, fontWeight: '600', paddingVertical: 8 }}
      />
      <TextInput
        placeholder="Start writing..."
        value={content}
        onChangeText={setContent}
        style={{ flex: 1, textAlignVertical: 'top', fontSize: 16 }}
        multiline
      />
      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}>
        <Button title={thinking ? 'Thinking…' : 'Reflect'} onPress={onReflect} disabled={thinking} />
        <Button title="Save" onPress={onSave} />
      </View>
    </View>
  );
}