const KIE_BASE_URL = 'https://api.kie.ai';

// Convert local URI or Data URL to base64 Data URL
export async function uriToDataUrl(uri) {
  if (uri.startsWith('data:image/')) {
    return uri;
  }
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(new Error('Không thể đọc file ảnh'));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload an image to Kie.ai temporary file storage
 * Endpoint: POST https://api.kie.ai/api/file-base64-upload
 */
export async function uploadImageToKie(imageUriOrBase64, apiKey) {
  // If it is already a hosted public URL, return it directly
  if (imageUriOrBase64.startsWith('http://') || imageUriOrBase64.startsWith('https://')) {
    return imageUriOrBase64;
  }

  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Chưa cung cấp Kie.ai API Key. Vui lòng cấu hình trong Cài đặt.');
  }

  const dataUrl = await uriToDataUrl(imageUriOrBase64);

  const endpoints = [
    `${KIE_BASE_URL}/api/file-base64-upload`,
    `${KIE_BASE_URL}/api/v1/file-base64-upload`,
    'https://kieai.redpandaai.co/api/file-base64-upload',
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data: dataUrl,
          uploadPath: 'images/base64',
          fileName: `kie_input_${Date.now()}.png`,
        }),
      });

      if (response.ok) {
        const resJson = await response.json();
        const downloadUrl =
          resJson?.data?.downloadUrl ||
          resJson?.data?.fileUrl ||
          resJson?.data?.url ||
          resJson?.downloadUrl ||
          resJson?.url;

        if (downloadUrl) {
          return downloadUrl;
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(
          errJson?.msg || errJson?.message || `Lỗi tải ảnh lên Kie.ai (HTTP ${response.status})`
        );
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể tải ảnh lên máy chủ Kie.ai');
}

/**
 * Create an asynchronous generation task on Kie.ai
 * Endpoint: POST https://api.kie.ai/api/v1/jobs/createTask
 */
export async function createKieTask(params) {
  const cleanKey = (params.apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Chưa có Kie.ai API Key. Vui lòng vào Cài đặt để nhập Key.');
  }

  const inputPayload = {
    prompt: params.prompt,
    aspect_ratio: params.aspectRatio || '1:1',
    resolution: params.resolution || '1K',
    output_format: params.outputFormat || 'png',
    num_images: 1,
    enhance_prompt: params.enhancePrompt ?? false,
  };

  if (params.imageUrls && params.imageUrls.length > 0) {
    inputPayload.image_urls = params.imageUrls;
  }

  const requestBody = {
    model: params.model,
    input: inputPayload,
  };

  const response = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.msg || errorData?.message || `Khởi tạo tác vụ Kie.ai thất bại (HTTP ${response.status})`
    );
  }

  const json = await response.json();
  if (json.code !== 200 || !json.data?.taskId) {
    throw new Error(json.msg || 'Kie.ai không trả về mã tác vụ (taskId).');
  }

  return json.data.taskId;
}

/**
 * Poll task result from Kie.ai until success or failure
 * Endpoint: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...
 */
export async function pollKieTaskResult(
  taskId,
  apiKey,
  onStatusUpdate,
  maxAttempts = 50,
  intervalMs = 2000
) {
  const cleanKey = (apiKey || '').trim();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    try {
      const response = await fetch(
        `${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${cleanKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (attempt >= maxAttempts) {
          throw new Error(`Kiểm tra tiến trình Kie.ai thất bại (HTTP ${response.status})`);
        }
        continue;
      }

      const json = await response.json();
      const data = json.data;
      if (!data) continue;

      const state = (data.state || '').toLowerCase();

      if (state === 'waiting') {
        onStatusUpdate?.('Kie.ai: Đang xếp hàng chờ xử lý...');
      } else if (state === 'queuing') {
        onStatusUpdate?.('Kie.ai: Đang trong hàng đợi xử lý...');
      } else if (state === 'generating') {
        onStatusUpdate?.('Kie.ai FLUX.3: Đang kết xuất hình ảnh nghệ thuật...');
      } else if (state === 'success') {
        let finalUrl;

        if (data.resultJson) {
          try {
            const parsed =
              typeof data.resultJson === 'string'
                ? JSON.parse(data.resultJson)
                : data.resultJson;

            finalUrl =
              parsed?.resultUrls?.[0] ||
              parsed?.images?.[0]?.url ||
              parsed?.image_urls?.[0] ||
              parsed?.url;
          } catch {
            // Ignore parse errors, try other fallbacks
          }
        }

        if (!finalUrl && Array.isArray(data.resultUrls) && data.resultUrls.length > 0) {
          finalUrl = data.resultUrls[0];
        }

        if (!finalUrl && data.downloadUrl) {
          finalUrl = data.downloadUrl;
        }

        if (finalUrl) {
          return finalUrl;
        }

        throw new Error('Kie.ai báo thành công nhưng không tìm thấy đường dẫn ảnh kết quả.');
      } else if (state === 'fail') {
        const failMessage = data.failMsg || data.failCode || 'Tác vụ Kie.ai thất bại.';
        throw new Error(`Kie.ai báo lỗi: ${failMessage}`);
      }
    } catch (err) {
      if (err?.message?.includes('Kie.ai báo lỗi:')) {
        throw err;
      }
      if (attempt >= maxAttempts) {
        throw err;
      }
    }
  }

  throw new Error('Hết thời gian chờ từ Kie.ai (Timeout). Vui lòng thử lại.');
}

/**
 * Unified generation & editing orchestrator for Kie.ai FLUX.3 Klein
 * Dispatches between:
 * - Text-to-Image: `flux-3/klein-text-to-image`
 * - Image-to-Image / Edit: `flux-3/klein-edit-image`
 */
export async function generateOrEditWithKie(params) {
  const isEditing = Boolean(params.imageUri);
  const model = isEditing ? 'flux-3/klein-edit-image' : 'flux-3/klein-text-to-image';

  let hostedImageUrls;

  if (isEditing && params.imageUri) {
    params.onStatusUpdate?.('Đang chuẩn bị và tải ảnh gốc lên Kie.ai...');
    const uploadedUrl = await uploadImageToKie(params.imageUri, params.apiKey);
    hostedImageUrls = [uploadedUrl];
  }

  params.onStatusUpdate?.(
    isEditing
      ? 'Đang khởi tạo tác vụ FLUX.3 Klein Edit Image...'
      : 'Đang khởi tạo tác vụ FLUX.3 Klein Text-to-Image...'
  );

  const taskId = await createKieTask({
    apiKey: params.apiKey,
    model,
    prompt: params.prompt,
    imageUrls: hostedImageUrls,
    aspectRatio: params.aspectRatio,
    resolution: params.resolution,
    outputFormat: params.outputFormat,
    enhancePrompt: params.enhancePrompt,
  });

  params.onStatusUpdate?.('Tác vụ đã tạo, đang kết nối hàng đợi Kie.ai...');

  const finalImageUrl = await pollKieTaskResult(
    taskId,
    params.apiKey,
    params.onStatusUpdate
  );

  return {
    url: finalImageUrl,
    modelUsed: `Kie.ai FLUX.3 (${isEditing ? 'Image-to-Image' : 'Text-to-Image'})`,
    taskId,
  };
}
