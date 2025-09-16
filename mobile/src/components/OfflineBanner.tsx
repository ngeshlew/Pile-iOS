import React from 'react';
import { View, Text } from 'react-native';

export default function OfflineBanner() {
  return (
    <View style={{ backgroundColor: '#fde047', paddingVertical: 6, alignItems: 'center' }}>
      <Text style={{ color: '#000', fontWeight: '600' }}>Offline — changes are saved locally</Text>
    </View>
  );
}