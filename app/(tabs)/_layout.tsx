import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00008B',
        tabBarStyle: {
          height: 60, 
          paddingBottom: 5, 
        },
        
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather size={25} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Trasações',
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather size={25} name="repeat" color={color} />,
        }}
      />

      <Tabs.Screen
        name="categorias"
        options={{
          title: 'Categorias',
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather size={25} name="clipboard" color={color} />,
        }}
      />

      <Tabs.Screen
        name="annotation"
        options={{
          title: 'Anotações',
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather size={25} name="edit" color={color} />,
        }}
      />
    </Tabs>
  );
}
