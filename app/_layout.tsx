import { initializeDatabase } from '@/database/initializeDatabase';
import { store } from '@/store';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

export default function Layout() {

  useEffect(() => {
      NavigationBar.setButtonStyleAsync('light');
    }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SQLiteProvider databaseName="mydatabase.db" onInit={initializeDatabase} children={
          <SafeAreaView style={{backgroundColor: "#004880", flex: 1}} edges={['bottom', 'top']}>
            <StatusBar 
              style="light"
              backgroundColor='#004880'
            />
          <Stack>
            <Stack.Screen 
              name="(tabs)"
              options={{ 
                headerShown: false,
                animation: 'fade',
               }}
            />

            <Stack.Screen
              name="entrada"
              options={{
                headerShown: false,
                presentation: 'modal'
               }}
            />

            <Stack.Screen
              name="saida"
              options={{
                headerShown: false,
                presentation: 'modal'
               }} 
            />

            <Stack.Screen
              name="anotacao"
              options={{
                headerShown: false,
                presentation: 'modal'
               }}
            />
          </Stack>
          </SafeAreaView>
        }/>
      </Provider>
    </GestureHandlerRootView>
  );
}