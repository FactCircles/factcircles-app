// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useSessionStore } from '../src/store/sessionStore';

export default function RootLayout() {
  const loadSavedSessions = useSessionStore((s) => s.loadSavedSessions);

  useEffect(() => {
    loadSavedSessions();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A1628' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="session/setup" />
        <Stack.Screen name="session/invite" />
        <Stack.Screen name="session/payment" />
        <Stack.Screen name="session/lobby" />
        <Stack.Screen name="session/intro" />
        <Stack.Screen name="session/questions" />
        <Stack.Screen name="session/solutions" />
        <Stack.Screen name="session/complete" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
