import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerDemo() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chọn ảnh từ thư viện
  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Bạn cần cấp quyền truy cập thư viện ảnh để tiếp tục.'
        );
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Chụp ảnh từ Camera
  const takePhotoWithCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (!cameraPermission.granted) {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Bạn cần cấp quyền sử dụng camera để chụp ảnh.'
        );
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xóa ảnh đã chọn
  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Demo Expo ImagePicker</Text>
      <Text style={styles.cardSubtitle}>
        Chọn ảnh từ thư viện hoặc chụp ảnh mới với Camera
      </Text>

      {/* Khu vực hiển thị ảnh */}
      <View style={styles.previewContainer}>
        {loading ? (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
          </View>
        ) : selectedImage ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>
                {selectedImage.width} x {selectedImage.height} px
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Chưa có ảnh nào được chọn</Text>
          </View>
        )}
      </View>

      {/* Các nút bấm thao tác */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={pickImageFromGallery}
          activeOpacity={0.8}>
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.primaryButtonText}>Chọn từ thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={takePhotoWithCamera}
          activeOpacity={0.8}>
          <Text style={styles.buttonIcon}>📸</Text>
          <Text style={styles.secondaryButtonText}>Chụp ảnh mới</Text>
        </TouchableOpacity>

        {selectedImage && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={clearImage}
            activeOpacity={0.8}>
            <Text style={styles.deleteButtonText}>✕ Xóa ảnh</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  previewContainer: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonGroup: {
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
});
