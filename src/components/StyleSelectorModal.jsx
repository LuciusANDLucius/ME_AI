import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';

import { STYLE_PRESETS } from '@/constants/ai-presets';
import { AppIcon } from '@/components/ui/app-icon';

export function StyleSelectorModal({
  visible,
  selectedStyleId,
  onSelectStyle,
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
              <Text style={styles.title}>Chọn phong cách nghệ thuật</Text>
              <Text style={styles.subtitle}>AI sẽ áp dụng phong cách này khi tạo hoặc biến đổi ảnh</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={15} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.styleList} contentContainerStyle={styles.listContent}>
            {STYLE_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedStyleId;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.styleCard, isSelected && styles.selectedCard]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelectStyle(preset);
                    onClose();
                  }}>
                  <View style={styles.cardLeft}>
                    <View style={styles.cardIconBox}>
                      <AppIcon name="palette" size={18} color={isSelected ? '#38bdf8' : '#818cf8'} />
                    </View>
                    <View style={styles.textCol}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.styleName, isSelected && styles.selectedStyleName]}>
                          {preset.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <AppIcon name="check" size={10} color="#38bdf8" />
                            <Text style={styles.checkText}>Đang chọn</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.styleDesc}>{preset.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
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
    maxHeight: '80%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
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
  styleList: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 12,
    gap: 10,
  },
  styleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedStyleName: {
    color: '#60a5fa',
  },
  checkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  checkText: {
    fontSize: 10.5,
    color: '#38bdf8',
    fontWeight: '700',
  },
  styleDesc: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginTop: 2,
  },
});
