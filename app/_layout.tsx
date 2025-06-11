import { initializeDatabase } from '@/database/initializeDatabase';
import { store } from '@/store';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SQLiteProvider databaseName="mydatabase.db" onInit={initializeDatabase}>
          <SafeAreaView style={{backgroundColor: "#7C4DFF", flex: 1}} edges={['bottom', 'top']}>
            <StatusBar 
              style="light"
              backgroundColor='#7C4DFF'
            />
          <Stack>
            <Stack.Screen 
              name="(tabs)"
              options={{ 
                headerShown: false,
                animation: 'slide_from_right',
               }} 
            />

            <Stack.Screen 
              name="entrada"
              options={{ 
                headerShown: false,
                animation: 'fade_from_bottom',
                presentation: 'modal'
               }} 
            />

            <Stack.Screen 
              name="saida"
              options={{ 
                headerShown: false,
                animation: 'fade_from_bottom',
                presentation: 'modal'
               }} 
            />
          </Stack>
          </SafeAreaView>
        </SQLiteProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}