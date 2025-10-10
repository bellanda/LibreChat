/**
 * Removes integrity and crossorigin attributes from HTML content
 * This prevents SRI validation errors when LLMs generate incorrect/outdated hashes
 * @param htmlContent - The HTML content to clean
 * @returns Cleaned HTML content
 */
export function cleanHtmlForRendering(htmlContent: string): string {
  // Remove integrity attributes from script/link tags to prevent SRI validation errors
  let cleaned = htmlContent.replace(/\s+integrity=["'][^"']*["']/gi, '');
  // Remove crossorigin attributes that can cause CORS issues
  cleaned = cleaned.replace(/\s+crossorigin=["'][^"']*["']/gi, '');
  return cleaned;
}
