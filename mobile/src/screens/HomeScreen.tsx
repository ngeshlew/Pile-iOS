import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { JournalPost, Storage } from '../services/storage';
import * as Haptics from 'expo-haptics';
import { Search } from '../services/search';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerLargeTitle: Platform.OS === 'ios' });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const all = await Storage.getAllPosts();
      setPosts(all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
    return unsubscribe;
  }, [navigation]);

  const onOpen = (id: string) => {
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    navigation.navigate('Detail', { id });
  };

  const filtered = posts;

  const onSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      const all = await Storage.getAllPosts();
      setPosts(all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      return;
    }
    const ids = await Search.search(text);
    const all = await Storage.getAllPosts();
    const byId = new Map(all.map((p) => [p.id, p] as const));
    const result = ids.map((id) => byId.get(id)).filter(Boolean) as JournalPost[];
    setPosts(result);
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="New" onPress={() => navigation.navigate('Compose')} />
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>

      <TextInput
        placeholder="Search entries"
        value={query}
        onChangeText={onSearch}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 }}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ paddingVertical: 12 }} onPress={() => onOpen(item.id)}>
            <Text style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
              {item.title || 'Untitled entry'}
            </Text>
            <Text numberOfLines={2} style={{ opacity: 0.8 }}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
        ListEmptyComponent={<Text>No entries yet. Tap New to create one.</Text>}
      />
    </View>
  );
}