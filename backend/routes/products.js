const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get product stats - FIXED VERSION
router.get('/stats', auth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        
        // Get all products for calculations
        const allProducts = await Product.find();
        
        // Calculate low stock, critical stock, and total value
        let lowStock = 0;
        let criticalStock = 0;
        let totalValue = 0;
        
        allProducts.forEach(p => {
            const qty = p.quantityOnHand || 0;
            const min = p.minStock || 50;
            
            // Calculate value
            totalValue += (p.sellingPrice || 0) * qty;
            
            // Count low stock (only if there's stock and it's below min)
            if (qty > 0 && qty <= min) {
                lowStock++;
            }
            
            // Count critical stock (only if there's stock and it's below 10)
            if (qty > 0 && qty < 10) {
                criticalStock++;
            }
        });
        
        res.json({
            success: true,
            data: {
                totalProducts,
                lowStock,
                criticalStock,
                totalValue: Math.round(totalValue)
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create product
router.post('/', auth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
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
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
