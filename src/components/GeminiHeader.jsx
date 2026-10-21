import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { getAppTheme } from '@/constants/theme';

export function GeminiHeader({
  settings,
  onOpenSettings,
  onClearChat,
  onNewChat,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isStudioActive = pathname === '/' || pathname === '';
  const isExploreActive = pathname === '/explore';

  const accentColor = settings?.accentColor || '#a855f7';
  const theme = getAppTheme(settings?.themeMode);
  const hasKieKey = Boolean(settings?.kieApiKey?.trim());
  const isKieActive = (settings?.textImageEngine === 'kie-flux3' || settings?.imageEngine === 'kie-flux3') && hasKieKey;

  const currentModeTitle = isStudioActive ? 'Text to Image' : 'Image to Image';
  const currentEngine = isStudioActive
    ? settings?.textImageEngine === 'kie-flux3'
      ? 'FLUX.3 Klein'
      : `Pollinations (${(settings?.pollinationsModel || 'flux.1').split('/').pop()})`
    : 'FLUX.3 Edit';

  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {/* Brand Logo */}
      <View style={styles.brandRow}>
        <View style={[styles.sparkleContainer, { borderColor: `${accentColor}40`, backgroundColor: `${accentColor}18` }]}>
          <AppIcon name={isStudioActive ? 'sparkles' : 'wand'} size={18} color={accentColor} />
        </View>
        <View style={styles.brandTextCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.brandTitle, { color: theme.text }]}>ME AI</Text>
            <View style={[styles.modeBadge, { backgroundColor: `${accentColor}25` }]}>
              <Text style={[styles.modeBadgeText, { color: accentColor }]}>{currentModeTitle}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onOpenSettings}
            activeOpacity={0.7}
            style={[
              styles.pillBadge,
              {
                backgroundColor: theme.isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme.border,
              },
            ]}>
            <View style={[styles.statusDot, { backgroundColor: isStudioActive ? '#10b981' : '#a855f7' }]} />
            <Text style={[styles.pillText, { color: theme.subText }]} numberOfLines={1}>{currentEngine}</Text>
            <AppIcon name="chevron-down" size={9} color={theme.subText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header action buttons */}
      <View style={styles.actionsRow}>
        {onNewChat && isStudioActive && (
          <TouchableOpacity
            onPress={onNewChat}
            style={[
              styles.iconButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Tạo mới">
            <AppIcon name="plus" size={15} color={theme.text} />
          </TouchableOpacity>
        )}

        {onClearChat && isStudioActive && (
          <TouchableOpacity
            onPress={onClearChat}
            style={[
              styles.iconButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Xóa lịch sử">
            <AppIcon name="trash" size={14} color={theme.subText} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onOpenSettings}
          style={[styles.iconButton, { borderColor: `${accentColor}50`, backgroundColor: `${accentColor}20` }]}
          activeOpacity={0.7}
          accessibilityLabel="Cài đặt">
          <AppIcon name="settings" size={15} color={accentColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(9, 13, 22, 0.95)',
    zIndex: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
      },
      default: {},
    }),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTextCol: {
    gap: 2,
  },
  sparkleContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
      },
      default: {},
    }),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  modeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  navSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 11,
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  navTabActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  navTabActiveExplore: {
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.35)',
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  navTabTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  navTabTextActiveExplore: {
    color: '#f472b6',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  settingsBtn: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
    ...Platform.select({
      web: {
        boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
      },
      default: {},
    }),
  },
});
