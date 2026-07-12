const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StockTransaction = require('../models/StockTransaction');

// ============================================================
// GET ALL TRANSACTIONS
// ============================================================
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        
        const transactions = await StockTransaction.find()
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        
        const total = await StockTransaction.countDocuments();
        
        res.json({
            success: true,
            data: transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions'
        });
    }
});

// ============================================================
// GET TRANSACTIONS FOR A SPECIFIC PRODUCT
// ============================================================
router.get('/product/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit = 50 } = req.query;
        
        const transactions = await StockTransaction.find({ productId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Get product transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product transactions'
        });
    }
});

// ============================================================
// GET TRANSACTION BY ID
// ============================================================
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await StockTransaction.findById(id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction'
        });
    }
});

// ============================================================
// GET TRANSACTION STATISTICS
// ============================================================
router.get('/stats/summary', auth, async (req, res) => {
    try {
        const totalTransactions = await StockTransaction.countDocuments();
        
        const totalReceived = await StockTransaction.aggregate([
            { $match: { type: 'receive' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        
        const totalDispensed = await StockTransaction.aggregate([
            { $match: { type: 'dispense' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        
        const totalAdjusted = await StockTransaction.aggregate([
            { $match: { type: 'adjustment' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        
        res.json({
            success: true,
            data: {
                totalTransactions,
                totalReceived: totalReceived[0]?.total || 0,
                totalDispensed: totalDispensed[0]?.total || 0,
                totalAdjusted: totalAdjusted[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;