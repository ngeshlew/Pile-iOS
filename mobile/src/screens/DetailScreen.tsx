import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Storage, JournalPost } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList & { Detail: { id: string } }, any> & {
  route: { params: { id: string } };
};

export default function DetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    Storage.getPost(id).then((post) => {
      if (!post) return;
      setTitle(post.title || '');
      setContent(post.content || '');
    });
  }, [id]);

  const onSave = async () => {
    await Storage.updatePost(id, { title, content });
    Alert.alert('Saved', 'Entry updated.');
  };

  const onDelete = async () => {
    await Storage.deletePost(id);
    navigation.goBack();
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
        placeholder="Edit your entry..."
        value={content}
        onChangeText={setContent}
        style={{ flex: 1, textAlignVertical: 'top', fontSize: 16 }}
        multiline
      />
      <Button title="Save" onPress={onSave} />
      <Button title="Delete" color="#cc0000" onPress={onDelete} />
    </View>
  );
}