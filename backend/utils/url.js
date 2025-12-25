const getPublicBaseUrl = (req) => {
    const configured = process.env.PUBLIC_BASE_URL;
    if (configured) return configured.replace(/\/+$/, '');
    return `${req.protocol}://${req.get('host')}`;
};

const getFileUrl = (req, fileId) => `${getPublicBaseUrl(req)}/api/files/${fileId}`;

module.exports = { getPublicBaseUrl, getFileUrl };

