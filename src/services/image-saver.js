import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

/**
 * Prepares a local file URI from any image source (remote URL, base64, or local path)
 */
async function ensureLocalFileUri(imageUri) {
  if (!imageUri) {
    throw new Error('Đường dẫn ảnh không hợp lệ');
  }

  // Already a local file
  if (imageUri.startsWith('file://')) {
    return imageUri;
  }

  const timestamp = Date.now();

  // Base64 data URI
  if (imageUri.startsWith('data:image/')) {
    const extMatch = imageUri.match(/^data:image\/(\w+);base64,/);
    const ext = extMatch ? extMatch[1] : 'png';
    const base64Data = imageUri.replace(/^data:image\/\w+;base64,/, '');
    const filename = `ME_AI_${timestamp}.${ext}`;
    const targetPath = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(targetPath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return targetPath;
  }

  // Remote HTTP/HTTPS URL
  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    // Determine extension
    let ext = 'png';
    const cleanUrl = imageUri.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) ext = 'jpg';
    else if (cleanUrl.endsWith('.webp')) ext = 'webp';

    const filename = `ME_AI_${timestamp}.${ext}`;
    const targetPath = `${FileSystem.cacheDirectory}${filename}`;

    const downloadResult = await FileSystem.downloadAsync(imageUri, targetPath);
    if (!downloadResult || downloadResult.status !== 200) {
      throw new Error('Không thể tải dữ liệu ảnh từ máy chủ');
    }
    return downloadResult.uri;
  }

  return imageUri;
}

/**
 * Saves image directly to the iPhone/Android Photo Library (Camera Roll)
 */
export async function saveImageToGallery(imageUri, { albumName = 'ME-AI Studio' } = {}) {
  // Web fallback
  if (Platform.OS === 'web') {
    try {
      if (typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = imageUri;
        a.download = `ME_AI_${Date.now()}.png`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return { success: true, method: 'web-download' };
      }
    } catch (e) {
      throw new Error(`Tải ảnh thất bại: ${e.message}`);
    }
  }

  try {
    // 1. Prepare local file
    const localUri = await ensureLocalFileUri(imageUri);

    // 2. Request MediaLibrary permission on iOS & Android
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync(true);

    if (status === 'granted') {
      // 3. Create asset in Photos Library
      const asset = await MediaLibrary.createAssetAsync(localUri);

      // 4. Try grouping into album 'ME-AI Studio'
      try {
        let album = await MediaLibrary.getAlbumAsync(albumName);
        if (!album) {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (albumErr) {
        // Even if album grouping fails on certain Android skins, asset is safely saved in Photos!
        console.warn('Could not add to album:', albumErr?.message);
      }

      return { success: true, method: 'library' };
    }

    // 5. If Photo Library permission is not granted, gracefully fallback to iOS Native Share Sheet!
    // On iOS, Sharing.shareAsync lets the user tap "Save Image" (Lưu hình ảnh) directly without permissions!
    const isShareAvailable = await Sharing.isAvailableAsync();
    if (isShareAvailable) {
      await Sharing.shareAsync(localUri, {
        UTI: 'public.png',
        mimeType: 'image/png',
        dialogTitle: 'Lưu hoặc chia sẻ ảnh AI',
      });
      return { success: true, method: 'share-fallback' };
    }

    throw new Error('Chưa được cấp quyền lưu ảnh vào Thư viện. Vui lòng vào Cài đặt để cấp quyền cho ứng dụng.');
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

/**
 * Opens native iOS / Android share sheet for the image
 */
export async function shareImage(imageUri) {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ME AI Art',
          text: 'Tạo từ ME AI Studio',
          url: imageUri,
        });
        return { success: true };
      } catch {
        // user cancelled or not supported
      }
    }
    // Web fallback: open in new tab
    if (typeof window !== 'undefined') {
      window.open(imageUri, '_blank');
      return { success: true };
    }
  }

  const localUri = await ensureLocalFileUri(imageUri);
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(localUri, {
      UTI: 'public.png',
      mimeType: 'image/png',
      dialogTitle: 'Chia sẻ ảnh nghệ thuật ME AI',
    });
    return { success: true };
  } else {
    throw new Error('Thiết bị không hỗ trợ tính năng chia sẻ này.');
  }
}
