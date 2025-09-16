import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, FlatList, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Storage } from '../services/storage';
import { generateReflection } from '../services/ai';
import { isOffline } from '../services/network';
import EditorToolbar from '../components/EditorToolbar';
import { pickMedia, startRecording } from '../services/media';

type Props = NativeStackScreenProps<RootStackParamList, 'Compose'>;

export default function ComposeScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thinking, setThinking] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  const onSave = async () => {
    const trimmed = (content || '').trim();
    if (!trimmed && attachments.length === 0) {
      Alert.alert('Empty', 'Write something or attach media before saving.');
      return;
    }
    await Storage.createPost({ title: title.trim() || undefined, content: trimmed, attachments });
    navigation.goBack();
  };

  const onReflect = async () => {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      Alert.alert('Empty', 'Write something first to reflect on.');
      return;
    }
    if (await isOffline()) {
      Alert.alert('Offline', 'AI reflections require an internet connection.');
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

  const applyWrap = (prefix: string, suffix: string) => {
    setContent((prev) => `${prefix}${prev}${suffix}`);
  };

  const onBold = () => applyWrap('**', '**');
  const onItalic = () => applyWrap('*', '*');
  const onLink = () => setContent((prev) => `${prev}\n[link text](https://example.com)`);

  const onAttach = async () => {
    const uris = await pickMedia();
    if (uris.length) setAttachments((prev) => Array.from(new Set([...prev, ...uris])));
  };

  const onRecord = async () => {
    const handle = await startRecording();
    if (!handle) return;
    Alert.alert('Recording', 'Tap OK to stop recording.', [
      {
        text: 'OK',
        onPress: async () => {
          const uri = await handle.stop();
          if (uri) setAttachments((prev) => [...prev, uri]);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <EditorToolbar onBold={onBold} onItalic={onItalic} onLink={onLink} onAttach={onAttach} />
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
      {attachments.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '600' }}>Attachments</Text>
          <FlatList
            data={attachments}
            keyExtractor={(u) => u}
            horizontal
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width: 80, height: 80, marginRight: 8, borderRadius: 8 }} />
            )}
          />
          <Button title="Record audio" onPress={onRecord} />
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}>
        <Button title={thinking ? 'Thinking…' : 'Reflect'} onPress={onReflect} disabled={thinking} />
        <Button title="Save" onPress={onSave} />
      </View>
    </View>
  );
}