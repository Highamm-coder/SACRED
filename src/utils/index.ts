
export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

export function getSiteUrl() {
    // In production, use the configured site URL
    // In development, fall back to window.location.origin
    const configuredUrl = import.meta.env.VITE_SITE_URL;
    
    if (configuredUrl) {
        return configuredUrl;
    }
    
    // Fallback for development or when VITE_SITE_URL is not set
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    
    // Server-side fallback (shouldn't happen in this app but good practice)
    return 'https://www.sacredonline.co';
}