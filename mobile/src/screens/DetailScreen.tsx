import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, FlatList, Text, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Storage, JournalPost } from '../services/storage';
import EditorToolbar from '../components/EditorToolbar';
import { pickMedia } from '../services/media';

type Props = NativeStackScreenProps<RootStackParamList & { Detail: { id: string } }, any> & {
  route: { params: { id: string } };
};

export default function DetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    Storage.getPost(id).then((post) => {
      if (!post) return;
      setTitle(post.title || '');
      setContent(post.content || '');
      setAttachments(post.attachments || []);
    });
  }, [id]);

  const onSave = async () => {
    await Storage.updatePost(id, { title, content, attachments });
    Alert.alert('Saved', 'Entry updated.');
  };

  const onDelete = async () => {
    await Storage.deletePost(id);
    navigation.goBack();
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
        placeholder="Edit your entry..."
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
        </View>
      )}
      <Button title="Save" onPress={onSave} />
      <Button title="Delete" color="#cc0000" onPress={onDelete} />
    </View>
  );
}