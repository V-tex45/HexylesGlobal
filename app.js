import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import ProjectsScreen from './src/screens/Projects';
import PaymentsScreen from './src/screens/Payments';
import ChangesScreen from './src/screens/Changes';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Projects') iconName = 'ios-home';
            if (route.name === 'Payments') iconName = 'ios-card';
            if (route.name === 'Changes') iconName = 'ios-create';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Projects" component={ProjectsScreen} />
        <Tab.Screen name="Payments" component={PaymentsScreen} />
        <Tab.Screen name="Changes" component={ChangesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}