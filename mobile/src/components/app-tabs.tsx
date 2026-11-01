import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AppIcon } from '@/components/app-icons';
import { Colors, Fonts, Radius } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: colors.backgroundSelected,
        tabBarStyle: {
          height: 76,
          paddingHorizontal: 8,
          paddingTop: 4,
          paddingBottom: 4,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarItemStyle: {
          marginHorizontal: 4,
          marginVertical: 2,
          borderRadius: Radius.md,
        },
        tabBarIconStyle: { marginTop: 2 },
        tabBarLabelStyle: {
          fontFamily: Fonts.regular,
          fontSize: 12,
          lineHeight: 16,
          marginBottom: 1,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <AppIcon name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="centers"
        options={{
          title: 'Centros',
          tabBarLabel: 'Centros',
          tabBarIcon: ({ color }) => <AppIcon name="map-pin" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
