import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SVG_ICONS = {
  wand: (
    <>
      <path d="M15 4V2m0 16v-2m-8-6H5m16 0h-2m-2.5-6.5L15 6m-7.5 7.5L6 15m10.5 1.5L15 18m-7.5-7.5L6 9" />
      <path d="M9 15l11-11a2.12 2.12 0 0 0-3-3L6 12l-3 9 9-3z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 2l2.6 5.8L20 10.5l-5.4 2.7L12 19l-2.6-5.8L4 10.5l5.4-2.7z" />
      <path d="M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  'aspect-ratio': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="8 21 8 17 4 17" />
      <polyline points="16 3 16 7 20 7" />
    </>
  ),
  palette: (
    <>
      <path d="M12 2a10 10 0 0 0-10 10c0 4.42 3.58 8 8 8 1.1 0 2-.9 2-2 0-.55-.22-1.05-.58-1.42-.36-.36-.58-.87-.58-1.42 0-1.1.9-2 2-2h2.34c4.23 0 7.66-3.43 7.66-7.66C22.84 5.97 17.98 2 12 2z" />
      <circle cx="7.5" cy="11.5" r="1" />
      <circle cx="10.5" cy="7.5" r="1" />
      <circle cx="15.5" cy="8.5" r="1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>
  ),
  zoom: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: (
    <polyline points="20 6 9 17 4 12" />
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  'chevron-down': (
    <polyline points="6 9 12 15 18 9" />
  ),
  'chevron-right': (
    <polyline points="9 18 15 12 9 6" />
  ),
  'arrow-left': (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  zap: (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
};

// High-fidelity native vector icon mapping for iOS & Android
const IONICONS_MAP = {
  // Creation & AI
  wand: 'color-wand-outline',
  'wand-filled': 'color-wand',
  sparkles: 'sparkles',
  'sparkles-outline': 'sparkles-outline',
  zap: 'flash-outline',
  'zap-filled': 'flash',

  // Media & Studio
  image: 'image-outline',
  'image-filled': 'image',
  images: 'images-outline',
  camera: 'camera-outline',
  'camera-filled': 'camera',
  'aspect-ratio': 'scan-outline',
  crop: 'crop-outline',
  palette: 'color-palette-outline',
  'palette-filled': 'color-palette',
  zoom: 'search-outline',
  search: 'search-outline',
  layers: 'layers-outline',
  eye: 'eye-outline',

  // Actions & Controls
  send: 'paper-plane',
  'send-outline': 'paper-plane-outline',
  download: 'download-outline',
  copy: 'copy-outline',
  trash: 'trash-outline',
  'trash-filled': 'trash',
  refresh: 'reload-outline',
  settings: 'settings-outline',
  'settings-filled': 'settings-sharp',
  close: 'close',
  'close-circle': 'close-circle-outline',
  check: 'checkmark',
  'check-circle': 'checkmark-circle-outline',
  plus: 'add',
  'plus-circle': 'add-circle-outline',

  // Navigation
  'chevron-down': 'chevron-down',
  'chevron-right': 'chevron-forward',
  'chevron-up': 'chevron-up',
  'chevron-left': 'chevron-back',
  'arrow-left': 'arrow-back',
  'arrow-right': 'arrow-forward',

  // Extras
  info: 'information-circle-outline',
  heart: 'heart-outline',
  'heart-filled': 'heart',
  compass: 'compass-outline',
  sliders: 'options-outline',
  edit: 'create-outline',
  share: 'share-social-outline',
};

export function AppIcon({
  name,
  size = 18,
  color = '#ffffff',
  strokeWidth = 2,
  style,
}) {
  if (Platform.OS === 'web') {
    const content = SVG_ICONS[name] || SVG_ICONS.sparkles;
    return (
      <View style={[styles.wrapper, { width: size, height: size }, style]}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            display: 'block',
            width: size,
            height: size,
            pointerEvents: 'none',
          }}>
          {content}
        </svg>
      </View>
    );
  }

  // Native (iOS & Android) vector icon rendering
  const ioniconName = IONICONS_MAP[name] || name || 'sparkles';

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <Ionicons name={ioniconName} size={size} color={color} />
    </View>
  );
}

export default AppIcon;

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

