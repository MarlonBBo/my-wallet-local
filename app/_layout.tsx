import { initializeDatabase } from '@/database/initializeDatabase';
import { store } from '@/store';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <SQLiteProvider databaseName="mydatabase.db" onInit={initializeDatabase}>
          <Stack>
            <Stack.Screen 
              name="(tabs)"
              options={{ 
                headerShown: false,
                animation: 'slide_from_bottom'
               }} 
            />
            <Stack.Screen 
              name="categorias"
              options={{ 
                headerShown: false,
                animation: 'slide_from_bottom'
               }}  
            />
          </Stack>
        </SQLiteProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
