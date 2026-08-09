export class ImageService {
  /**
   * Generates a 100% free high-quality image using Pollinations.ai (FLUX.1 / SDXL model)
   */
  static generateFreeImage(prompt: string, width = 1024, height = 1024): string {
    const cleanPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    // Pollinations free FLUX / SDXL image generation URL
    return `https://pollinations.ai/p/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
  }
}
