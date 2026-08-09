export class ImageService {
  /**
   * Generates a 100% free high-quality image using Pollinations.ai (FLUX / SDXL / SANA)
   */
  static generateFreeImage(prompt: string, width = 1024, height = 1024): string {
    const cleanPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  }
}
