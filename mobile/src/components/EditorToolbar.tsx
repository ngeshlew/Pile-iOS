import React from 'react';
import { View, Button } from 'react-native';

type Props = {
  onBold: () => void;
  onItalic: () => void;
  onLink: () => void;
  onAttach: () => void;
};

export default function EditorToolbar({ onBold, onItalic, onLink, onAttach }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
      <Button title="B" onPress={onBold} />
      <Button title="I" onPress={onItalic} />
      <Button title="Link" onPress={onLink} />
      <Button title="Attach" onPress={onAttach} />
    </View>
  );
}