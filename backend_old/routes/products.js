const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin/Pharmacist)
router.post('/', protect, authorize('admin', 'pharmacist'), async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/products
// @desc    Get all products (with search)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }
        const products = await Product.find(query);
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin/Pharmacist)
router.put('/:id', protect, authorize('admin', 'pharmacist'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
