import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { ASPECT_RATIOS } from '@/constants/ai-presets';

export function AspectSelectorModal({
  visible,
  selectedRatio,
  onSelectRatio,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.title}>Tỉ lệ khung hình (Aspect Ratio)</Text>
              <Text style={styles.subtitle}>Chọn kích thước phù hợp với mục đích tạo ảnh của bạn</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={15} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsGrid}>
            {ASPECT_RATIOS.map((item) => {
              const isSelected = item.id === selectedRatio;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.ratioCard, isSelected && styles.selectedRatioCard]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelectRatio(item.id);
                    onClose();
                  }}>
                  <View style={[styles.visualBox, getVisualBoxStyle(item.id)]} />
                  <Text style={[styles.ratioLabel, isSelected && styles.selectedRatioLabel]}>
                    {item.label}
                  </Text>
                  <Text style={styles.ratioDim}>
                    {item.width} x {item.height}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getVisualBoxStyle(id) {
  switch (id) {
    case '1:1':
      return { width: 28, height: 28 };
    case '16:9':
      return { width: 36, height: 20 };
    case '9:16':
      return { width: 18, height: 32 };
    case '4:3':
      return { width: 32, height: 24 };
    case '3:4':
      return { width: 24, height: 32 };
    default:
      return { width: 28, height: 28 };
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  optionsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  ratioCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  selectedRatioCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  visualBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedRatioLabel: {
    color: '#60a5fa',
  },
  ratioDim: {
    fontSize: 11,
    color: '#64748b',
  },
});
