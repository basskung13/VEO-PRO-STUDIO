
import { SocialPlatform, VideoMetadata } from "../types";

interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
}

/**
 * Mock service for Upload-Post.com API
 * Simulates the upload process with progress tracking.
 */
export const uploadToSocialPlatform = async (
  platform: SocialPlatform,
  metadata: VideoMetadata,
  apiKey: string,
  onProgress: (progress: number) => void
): Promise<UploadResponse> => {
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in Global Settings.");
  }

  console.log(`[Upload-Post API] Starting upload to ${platform}...`);
  console.log(`[Upload-Post API] Metadata:`, metadata);

  // Simulate initialization latency
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate upload progress steps
  const totalSteps = 10;
  for (let i = 1; i <= totalSteps; i++) {
    // Random delay between steps to feel realistic
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 600)); 
    onProgress(i * 10);
  }

  // Simulate success/failure randomly (95% success rate)
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    return {
      success: true,
      message: `Successfully uploaded to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      url: `https://${platform}.com/video/${Date.now()}`
    };
  } else {
    throw new Error(`Failed to upload to ${platform}: Server Timeout or Auth Error`);
  }
};
