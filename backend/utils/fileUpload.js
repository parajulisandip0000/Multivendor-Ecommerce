const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

let bucket;

// Initialize GridFS bucket
const initGridFS = () => {
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, {
        bucketName: 'uploads',
    });
    console.log('GridFS initialized');
};

// Multer storage engine for GridFS
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    },
    fileFilter,
});

// Upload file to GridFS
const uploadToGridFS = (file) => {
    return new Promise((resolve, reject) => {
        if (!bucket) {
            return reject(new Error('GridFS not initialized'));
        }

        const filename = `${uuidv4()}-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: {
                originalName: file.originalname,
                uploadedAt: new Date(),
            },
        });

        uploadStream.on('error', (error) => {
            reject(error);
        });

        uploadStream.on('finish', () => {
            resolve({
                fileId: uploadStream.id,
                filename: filename,
                contentType: file.mimetype,
            });
        });

        uploadStream.end(file.buffer);
    });
};

// Delete file from GridFS
const deleteFromGridFS = async (fileId) => {
    if (!bucket) {
        throw new Error('GridFS not initialized');
    }

    try {
        await bucket.delete(new mongoose.Types.ObjectId(fileId));
        return true;
    } catch (error) {
        console.error('Error deleting file from GridFS:', error);
        return false;
    }
};

// Get file stream from GridFS
const getFileStream = (fileId) => {
    if (!bucket) {
        throw new Error('GridFS not initialized');
    }

    return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

// Get file info from GridFS
const getFileInfo = async (fileId) => {
    if (!bucket) {
        throw new Error('GridFS not initialized');
    }

    try {
        const files = await bucket
            .find({ _id: new mongoose.Types.ObjectId(fileId) })
            .toArray();
        return files.length > 0 ? files[0] : null;
    } catch (error) {
        console.error('Error getting file info:', error);
        return null;
    }
};

// Get file stream by name
const getFileStreamByName = (filename) => {
    if (!bucket) {
        throw new Error('GridFS not initialized');
    }

    return bucket.openDownloadStreamByName(filename);
};

// Get file info by name
const getFileInfoByName = async (filename) => {
    if (!bucket) {
        throw new Error('GridFS not initialized');
    }

    try {
        const files = await bucket.find({ filename }).toArray();
        return files.length > 0 ? files[0] : null;
    } catch (error) {
        console.error('Error getting file info:', error);
        return null;
    }
};

module.exports = {
    initGridFS,
    upload,
    uploadToGridFS,
    deleteFromGridFS,
    getFileStream,
    getFileInfo,
    getFileStreamByName,
    getFileInfoByName,
};
