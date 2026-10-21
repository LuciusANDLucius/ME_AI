import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { QUICK_PROMPTS } from '@/constants/ai-presets';

export function QuickChips({ onSelectPrompt }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {QUICK_PROMPTS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => onSelectPrompt(item.prompt, item.category)}>
            <View style={[styles.iconBox, { backgroundColor: `${item.accentColor}20` }]}>
              <AppIcon name={item.iconName || 'sparkles'} size={12} color={item.accentColor || '#38bdf8'} />
            </View>
            <Text style={styles.chipText}>{item.title}</Text>
            {Boolean(item.modelTag) && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.modelTag}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  iconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
