import { Tabs } from 'expo-router';
import React from 'react';

import { AppIcon } from '@/components/ui/app-icon';
import { getAppTheme } from '@/constants/theme';
import { loadAISettings } from '@/services/ai-service';

export default function AppTabs() {
  const [accentColor, setAccentColor] = React.useState('#a855f7');
  const [themeMode, setThemeMode] = React.useState('dark');

  React.useEffect(() => {
    loadAISettings().then((s) => {
      if (s?.accentColor) setAccentColor(s.accentColor);
      if (s?.themeMode) setThemeMode(s.themeMode);
    });
  }, []);

  const theme = getAppTheme(themeMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: theme.subText,
        tabBarStyle: {
          backgroundColor: theme.tabBg,
          borderTopColor: theme.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Text to Image',
          tabBarIcon: ({ color, size, focused }) => (
            <AppIcon
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Image to Image',
          tabBarIcon: ({ color, size, focused }) => (
            <AppIcon
              name={focused ? 'wand-filled' : 'wand'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
