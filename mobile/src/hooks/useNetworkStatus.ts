import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    Network.getNetworkStateAsync()
      .then((state) => {
        if (mounted) setIsOnline(Boolean(state.isConnected && state.isInternetReachable));
      })
      .catch(() => {});

    const interval = setInterval(() => {
      Network.getNetworkStateAsync()
        .then((state) => {
          if (!mounted) return;
          setIsOnline(Boolean(state.isConnected && state.isInternetReachable));
        })
        .catch(() => {});
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isOnline };
}