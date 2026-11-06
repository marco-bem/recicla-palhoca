import { Tabs } from 'expo-router';

import { AppIcon } from '@/components/app-icons';
import {
  BorderWidth,
  Colors,
  Fonts,
  Iconography,
  Layout,
  Radius,
  Spacing,
  Typography,
} from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: colors.backgroundSelected,
        tabBarStyle: {
          height: Layout.bottomTabHeight,
          paddingHorizontal: Spacing.space2,
          paddingTop: Spacing.space1,
          paddingBottom: Spacing.space1,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: BorderWidth.default,
          elevation: 0,
        },
        tabBarItemStyle: {
          marginHorizontal: Spacing.space1,
          marginVertical: Spacing.space1,
          borderRadius: Radius.md,
        },
        tabBarIconStyle: { marginTop: Spacing.space1 },
        tabBarLabelStyle: {
          fontFamily: Fonts.regular,
          fontSize: Typography.caption.fontSize,
          lineHeight: Typography.caption.lineHeight,
          marginBottom: Spacing.space1,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => (
            <AppIcon name="home" size={Iconography.sizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="centers"
        options={{
          title: 'Centros',
          tabBarLabel: 'Centros',
          tabBarIcon: ({ color }) => (
            <AppIcon name="map-pin" size={Iconography.sizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <AppIcon name="clipboard-list" color={color} />,
        }}
      />
    </Tabs>
  );
}
