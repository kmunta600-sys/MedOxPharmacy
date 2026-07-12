const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 100 } = req.query;
        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ name: searchRegex }, { code: searchRegex }, { category: searchRegex }, { batchNumber: searchRegex }, { supplier: searchRegex }];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const products = await Product.find(query).sort({ name: 1 }).skip(skip).limit(parseInt(limit));
        const total = await Product.countDocuments(query);
        res.json({ success: true, data: products, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});

// GET product stats
router.get('/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const lowStock = await Product.countDocuments({ quantityOnHand: { $gt: 0, $lte: 10 } });
        const criticalStock = await Product.countDocuments({ quantityOnHand: 0 });
        const products = await Product.find();
        const totalValue = products.reduce((sum, p) => sum + ((p.sellingPrice || 0) * (p.quantityOnHand || 0)), 0);
        res.json({ success: true, data: { totalProducts, lowStock, criticalStock, totalValue } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching product' });
    }
});

// POST create product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: 'Validation failed: ' + messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message || 'Error creating product' });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating product' });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting product' });
    }
});

module.exports = router;
