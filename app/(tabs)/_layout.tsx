import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C4DFF',
        tabBarStyle: {
          height: 60, 
          paddingBottom: 5, 
        },
        // animation: 'fade', 
        // tabBarHideOnKeyboard: true, 
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          headerShown: false,
          animation:'fade',
          tabBarIcon: ({ color }) => <Feather size={25} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Trasações',
          animation: "fade",
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather size={25} name="repeat" color={color} />,
        }}
      />

      <Tabs.Screen
        name="categorias"
        options={{
          title: 'Categorias',
          animation: "fade",
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather size={25} name="clipboard" color={color} />,
        }}
      />
    </Tabs>
  );
}
