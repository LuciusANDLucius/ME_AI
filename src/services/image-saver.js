import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Prepares a local file URI from any image source (remote URL, base64, content URI, or local file)
 */
async function ensureLocalFileUri(imageUri) {
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Đường dẫn ảnh không hợp lệ');
  }

  // Already a local file
  if (imageUri.startsWith('file://')) {
    return imageUri;
  }

  const timestamp = Date.now();

  // Android content URI (from ImagePicker or MediaStore: content://...)
  if (imageUri.startsWith('content://')) {
    const filename = `ME_AI_${timestamp}.jpg`;
    const targetPath = `${FileSystem.cacheDirectory}${filename}`;
    try {
      await FileSystem.copyAsync({ from: imageUri, to: targetPath });
      return targetPath;
    } catch (copyErr) {
      console.warn('Could not copy content:// URI, returning original:', copyErr?.message);
      return imageUri;
    }
  }

  // Base64 data URI (e.g. data:image/png;base64,... or data:image/jpeg;charset=utf-8;base64,...)
  if (imageUri.startsWith('data:image/')) {
    const commaIdx = imageUri.indexOf(',');
    if (commaIdx === -1) {
      throw new Error('Dữ liệu Base64 không hợp lệ');
    }
    const header = imageUri.substring(0, commaIdx).toLowerCase();
    const base64Data = imageUri.substring(commaIdx + 1).replace(/\s/g, '');

    let ext = 'png';
    if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';
    else if (header.includes('webp')) ext = 'webp';

    const filename = `ME_AI_${timestamp}.${ext}`;
    const targetPath = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(targetPath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return targetPath;
  }

  // Remote HTTP/HTTPS URL
  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    let ext = 'jpg'; // Default to jpg as most AI engines (Pollinations, Flux) generate JPEG
    const cleanUrl = imageUri.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.png')) ext = 'png';
    else if (cleanUrl.endsWith('.webp')) ext = 'webp';
    else if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) ext = 'jpg';

    const filename = `ME_AI_${timestamp}.${ext}`;
    const targetPath = `${FileSystem.cacheDirectory}${filename}`;

    // 1. Try fast native downloadAsync
    let downloadedUri = null;
    try {
      const downloadResult = await FileSystem.downloadAsync(imageUri, targetPath);
      if (downloadResult && downloadResult.status >= 200 && downloadResult.status < 400) {
        downloadedUri = downloadResult.uri;

        // Check if server Content-Type contradicts extension
        const contentType = (
          downloadResult.headers?.['content-type'] ||
          downloadResult.headers?.['Content-Type'] ||
          ''
        ).toLowerCase();

        if (contentType.includes('jpeg') && ext === 'png') {
          const newPath = `${FileSystem.cacheDirectory}ME_AI_${timestamp}.jpg`;
          await FileSystem.moveAsync({ from: downloadedUri, to: newPath });
          downloadedUri = newPath;
        } else if (contentType.includes('png') && ext === 'jpg') {
          const newPath = `${FileSystem.cacheDirectory}ME_AI_${timestamp}.png`;
          await FileSystem.moveAsync({ from: downloadedUri, to: newPath });
          downloadedUri = newPath;
        }
      }
    } catch (dlErr) {
      console.warn('downloadAsync failed, attempting fetch fallback:', dlErr?.message);
    }

    if (downloadedUri) {
      return downloadedUri;
    }

    // 2. Resilient fallback: fetch as blob and write as base64
    try {
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Không thể tải ảnh từ máy chủ (HTTP ${response.status})`);
      }
      const blob = await response.blob();
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          if (typeof res === 'string') {
            const parts = res.split(',');
            resolve(parts[1] || parts[0]);
          } else {
            resolve(null);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      if (!base64Data) {
        throw new Error('Không thể đọc dữ liệu ảnh');
      }

      const mimeType = (blob.type || '').toLowerCase();
      let fetchExt = ext;
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) fetchExt = 'jpg';
      else if (mimeType.includes('png')) fetchExt = 'png';
      else if (mimeType.includes('webp')) fetchExt = 'webp';

      const fallbackPath = `${FileSystem.cacheDirectory}ME_AI_${timestamp}.${fetchExt}`;
      await FileSystem.writeAsStringAsync(fallbackPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fallbackPath;
    } catch (fetchErr) {
      throw new Error(`Lỗi tải dữ liệu ảnh: ${fetchErr?.message || 'Không thể kết nối máy chủ'}`);
    }
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
      const filename = `ME_AI_${Date.now()}.png`;

      // If already a base64 or blob URL, trigger anchor click directly
      if (imageUri.startsWith('data:') || imageUri.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = imageUri;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return { success: true, method: 'web-download' };
      }

      // Remote cross-origin URL: fetch as blob first so the browser respects download attribute
      try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
        return { success: true, method: 'web-download' };
      } catch {
        // Fallback: open in new window if CORS forbids fetch
        if (typeof window !== 'undefined') {
          window.open(imageUri, '_blank');
          return { success: true, method: 'web-download' };
        }
      }
    } catch (e) {
      throw new Error(`Tải ảnh thất bại: ${e.message}`);
    }
  }

  // Native iOS & Android
  try {
    // 1. Prepare local file
    const localUri = await ensureLocalFileUri(imageUri);

    // 2. Request MediaLibrary permission on iOS & Android
    let permissionGranted = false;

    try {
      // Check existing permission
      // On iOS: writeOnly=true asks for NSPhotoLibraryAddUsageDescription (Add photos only)
      // On Android: writeOnly=false avoids obsolete WRITE_EXTERNAL_STORAGE rejection on Android 13+
      const isIos = Platform.OS === 'ios';
      let perm = await MediaLibrary.getPermissionsAsync(isIos);

      if (perm.granted || perm.status === 'granted' || perm.status === 'limited') {
        permissionGranted = true;
      } else if (perm.canAskAgain) {
        perm = await MediaLibrary.requestPermissionsAsync(isIos);
        if (perm.granted || perm.status === 'granted' || perm.status === 'limited') {
          permissionGranted = true;
        }
      }
    } catch (permErr) {
      console.warn('Error during MediaLibrary permission check:', permErr?.message);
    }

    // 3. Create asset in Photos Library
    // On Android 10+ (API 29+), Scoped Storage allows MediaStore asset creation even if write permission is not granted.
    try {
      const asset = await MediaLibrary.createAssetAsync(localUri);

      if (asset) {
        // 4. Try grouping into album 'ME-AI Studio' (safely with copyAsset=true)
        try {
          const album = await MediaLibrary.getAlbumAsync(albumName);
          if (!album) {
            await MediaLibrary.createAlbumAsync(albumName, asset, true);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
          }
        } catch (albumErr) {
          // Even if album grouping fails on certain Android skins or limited iOS permissions,
          // the asset is already safely in Photos / Camera Roll!
          console.log('Album grouping skipped:', albumErr?.message);
        }

        return { success: true, method: 'library', asset };
      }
    } catch (createErr) {
      console.warn('createAssetAsync failed, trying share sheet fallback:', createErr?.message);
    }

    // 5. If Photo Library saving failed or permission not granted, gracefully fallback to Native Share Sheet!
    // On iOS, Sharing.shareAsync lets the user tap "Save Image" (Lưu hình ảnh) directly without app permissions!
    const isShareAvailable = await Sharing.isAvailableAsync();
    if (isShareAvailable) {
      const isJpg = localUri.toLowerCase().endsWith('.jpg') || localUri.toLowerCase().endsWith('.jpeg');
      await Sharing.shareAsync(localUri, {
        UTI: isJpg ? 'public.jpeg' : 'public.png',
        mimeType: isJpg ? 'image/jpeg' : 'image/png',
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
    const isJpg = localUri.toLowerCase().endsWith('.jpg') || localUri.toLowerCase().endsWith('.jpeg');
    await Sharing.shareAsync(localUri, {
      UTI: isJpg ? 'public.jpeg' : 'public.png',
      mimeType: isJpg ? 'image/jpeg' : 'image/png',
      dialogTitle: 'Chia sẻ ảnh nghệ thuật ME AI',
    });
    return { success: true };
  } else {
    throw new Error('Thiết bị không hỗ trợ tính năng chia sẻ này.');
  }
}

