const express = require('express');
const router = express.Router();
const {
    getStorePublic,
    getStoreProductsPublic,
} = require('../controllers/storePublic.controller');

router.get('/:id', getStorePublic);
router.get('/:id/products', getStoreProductsPublic);

module.exports = router;

