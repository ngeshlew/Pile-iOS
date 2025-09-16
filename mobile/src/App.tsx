import React, { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ComposeScreen from './screens/ComposeScreen';
import SettingsScreen from './screens/SettingsScreen';
import DetailScreen from './screens/DetailScreen';
import { Storage } from './services/storage';
import OfflineBanner from './components/OfflineBanner';
import { useNetworkStatus } from './hooks/useNetworkStatus';

export type RootStackParamList = {
  Home: undefined;
  Compose: undefined;
  Settings: undefined;
  Detail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const scheme = useColorScheme();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    Storage.ensureInitialized();
  }, []);

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        {!isOnline && <OfflineBanner />}
        <View style={{ flex: 1 }}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Pile' }} />
            <Stack.Screen name="Compose" component={ComposeScreen} options={{ title: 'New Entry' }} />
            <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Edit Entry' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </View>
      </View>
    </NavigationContainer>
  );
}