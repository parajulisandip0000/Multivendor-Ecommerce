const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getBackendOrigin = () => {
    try {
        const u = new URL(API_URL);
        // If API_URL is ".../api", return origin without "/api"
        const basePath = u.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
        return `${u.origin}${basePath}`;
    } catch {
        return (API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');
    }
};

export const resolveBackendUrl = (value) => {
    if (!value) return null;
    const str = String(value);
    if (/^https?:\/\//i.test(str)) return str;

    const backendOrigin = getBackendOrigin();
    if (!backendOrigin) return str;

    if (str.startsWith('/')) return `${backendOrigin}${str}`;
    return `${backendOrigin}/${str}`;
};

export const resolveFileUrl = (value) => {
    if (!value) return null;
    const str = String(value);
    if (/^https?:\/\//i.test(str)) return str;

    // If already a path like "/api/files/..", prefix with backend origin
    if (str.startsWith('/')) return resolveBackendUrl(str);

    // If it's a Mongo ObjectId, treat it as a GridFS file id
    if (/^[0-9a-f]{24}$/i.test(str)) {
        return `${API_URL.replace(/\/+$/, '')}/files/${str}`;
    }

    return resolveBackendUrl(str);
};

export const getFileIdFromImage = (img) => {
    if (!img) return null;
    const raw = img.fileId || img._id;
    if (raw && /^[0-9a-f]{24}$/i.test(String(raw))) return String(raw);

    const url = img.url ? String(img.url) : '';
    const m = url.match(/\/api\/files\/([0-9a-f]{24})/i);
    return m?.[1] || null;
};

export const getPrimaryProductImageUrl = (product) => {
    const thumb = product?.thumbnail;
    if (thumb?.url || thumb?.fileId) {
        return resolveFileUrl(thumb.url || thumb.fileId);
    }

    const images = Array.isArray(product?.images) ? product.images : [];
    const img = images.find((i) => i?.isDefault) || images[0];
    if (!img) return null;

    return resolveFileUrl(img.url || img.fileId);
};
