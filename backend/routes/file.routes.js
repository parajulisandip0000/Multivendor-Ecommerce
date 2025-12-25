const express = require('express');
const router = express.Router();
const { getFileStream, getFileInfo, getFileStreamByName, getFileInfoByName } = require('../utils/fileUpload');

// @desc    Get file by ID
// @route   GET /api/files/:fileId
// @access  Public
router.get('/name/:filename', async (req, res, next) => {
    try {
        const { filename } = req.params;

        // Get file info
        console.log(`Looking for file: ${filename}`);
        const fileInfo = await getFileInfoByName(filename);
        if (!fileInfo) {
            console.log(`File not found in DB: ${filename}`);
            return res.status(404).json({
                success: false,
                message: 'File not found',
            });
        }
        console.log(`File found, content type: ${fileInfo.contentType}`);

        // Set headers
        res.set('Content-Type', fileInfo.contentType);
        res.set('Content-Disposition', `inline; filename="${fileInfo.filename}"`);
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');

        // Stream file
        const downloadStream = getFileStreamByName(filename);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving file',
            });
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get file by ID
// @route   GET /api/files/:fileId
// @access  Public
router.get('/:fileId', async (req, res, next) => {
    try {
        const { fileId } = req.params;

        // Get file info
        const fileInfo = await getFileInfo(fileId);
        if (!fileInfo) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
            });
        }

        // Set headers
        res.set('Content-Type', fileInfo.contentType);
        res.set('Content-Disposition', `inline; filename="${fileInfo.filename}"`);
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');

        // Stream file
        const downloadStream = getFileStream(fileId);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving file',
            });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
