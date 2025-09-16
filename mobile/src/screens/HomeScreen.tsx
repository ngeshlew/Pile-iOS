import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { JournalPost, Storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<JournalPost[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const all = await Storage.getAllPosts();
      setPosts(all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="New" onPress={() => navigation.navigate('Compose')} />
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ paddingVertical: 12 }} onPress={() => navigation.navigate('Detail', { id: item.id })}>
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