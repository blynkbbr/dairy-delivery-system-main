import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NotificationProvider } from './src/contexts/NotificationContext';
import RootNavigator from './src/navigation';

export default function App() {
  return (
    <NotificationProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </NotificationProvider>
  );
}
