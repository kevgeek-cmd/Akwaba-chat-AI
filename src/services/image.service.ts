export class ImageService {
  /**
   * Generates a 100% free ultra-high quality photorealistic image using Pollinations.ai FLUX
   */
  static generateFreeImage(prompt: string, width = 1024, height = 1024): string {
    const qualityBoost = ", photorealistic, 8k resolution, cinematic lighting, sharp focus, masterpiece, highly detailed, 35mm photograph";
    const fullPrompt = prompt.trim() + qualityBoost;
    const cleanPrompt = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
  }
}
