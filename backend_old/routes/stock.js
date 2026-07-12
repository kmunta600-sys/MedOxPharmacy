const express = require('express');
const router = express.Router();
const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const IntelligentStockService = require('../services/IntelligentStockService');

const stockService = new IntelligentStockService();

// @route   POST /api/stock/receive
// @desc    Receive stock (add inventory)
// @access  Private (Admin/Pharmacist)
router.post('/receive', protect, authorize('admin', 'pharmacist'), async (req, res) => {
    try {
        const { productId, quantity, batchNumber, expiryDate, unitCost, source, documentNumber, remarks } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const currentStock = await stockService.getCurrentStock(productId, req.user.facility || req.user._id);

        const transaction = await StockTransaction.create({
            product: productId,
            facility: req.user.facility || req.user._id,
            transactionType: 'receipt',
            quantityReceived: quantity,
            batchNumber,
            expiryDate: new Date(expiryDate),
            documentNumber,
            sourceOrDestination: source || 'supplier',
            sourceOrDestinationName: remarks || '',
            balanceAfter: currentStock + quantity,
            unitCost,
            totalCost: unitCost * quantity,
            transactingOfficer: req.user._id,
            status: 'completed'
        });

        res.status(201).json({
            success: true,
            data: transaction,
            message: `Received ${quantity} units of ${product.productName}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/stock/issue
// @desc    Issue stock (dispense)
// @access  Private
router.post('/issue', protect, async (req, res) => {
    try {
        const { productId, quantity, batchNumber, destination, destinationName, remarks } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const currentStock = await stockService.getCurrentStock(productId, req.user.facility || req.user._id);
        if (currentStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`
            });
        }

        const transaction = await StockTransaction.create({
            product: productId,
            facility: req.user.facility || req.user._id,
            transactionType: 'issue',
            quantityIssued: quantity,
            batchNumber,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            sourceOrDestination: destination || 'patient',
            sourceOrDestinationName: destinationName || '',
            balanceAfter: currentStock - quantity,
            transactingOfficer: req.user._id,
            status: 'completed',
            remarks
        });

        res.status(201).json({
            success: true,
            data: transaction,
            message: `Issued ${quantity} units of ${product.productName}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/stock/loss
// @desc    Record stock loss (expired, damaged)
// @access  Private (Admin/Pharmacist)
router.post('/loss', protect, authorize('admin', 'pharmacist'), async (req, res) => {
    try {
        const { productId, quantity, batchNumber, reason, remarks } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const currentStock = await stockService.getCurrentStock(productId, req.user.facility || req.user._id);
        if (currentStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`
            });
        }

        const transaction = await StockTransaction.create({
            product: productId,
            facility: req.user.facility || req.user._id,
            transactionType: 'loss',
            losses: quantity,
            batchNumber,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            sourceOrDestination: 'other',
            sourceOrDestinationName: reason || 'Loss',
            balanceAfter: currentStock - quantity,
            transactingOfficer: req.user._id,
            status: 'completed',
            remarks
        });

        res.status(201).json({
            success: true,
            data: transaction,
            message: `Recorded loss of ${quantity} units of ${product.productName}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/stock/balance/:productId
// @desc    Get current stock balance for a product
// @access  Private
router.get('/balance/:productId', protect, async (req, res) => {
    try {
        const balance = await stockService.getCurrentStock(
            req.params.productId,
            req.user.facility || req.user._id
        );
        res.json({ success: true, data: { balance } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/stock/alerts/reorder
// @desc    Get reorder alerts for all products
// @access  Private
router.get('/alerts/reorder', protect, async (req, res) => {
    try {
        const alerts = await stockService.checkReorderAlerts(req.user.facility || req.user._id);
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/stock/alerts/expiry
// @desc    Get expiry alerts (products expiring soon)
// @access  Private
router.get('/alerts/expiry', protect, async (req, res) => {
    try {
        const days = req.query.days || 90;
        const expiring = await stockService.getExpiryAlerts(
            req.user.facility || req.user._id,
            parseInt(days)
        );
        res.json({ success: true, data: expiring });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/stock/anomalies
// @desc    Detect anomalies in stock transactions
// @access  Private
router.get('/anomalies', protect, async (req, res) => {
    try {
        const anomalies = await stockService.detectAnomalies(req.user.facility || req.user._id);
        res.json({ success: true, data: anomalies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
