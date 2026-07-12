const Quarantine = require('../models/Quarantine');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

// ============================================================
// GET ALL QUARANTINED PRODUCTS
// ============================================================
exports.getAllQuarantined = async (req, res) => {
    try {
        const quarantined = await Quarantine.find()
            .sort({ quarantineDate: -1 })
            .populate('productId', 'name code strength batchNumber');

        res.json({
            success: true,
            count: quarantined.length,
            data: quarantined
        });
    } catch (error) {
        console.error('Get quarantined error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quarantined products'
        });
    }
};

// ============================================================
// QUARANTINE A PRODUCT
// ============================================================
exports.quarantineProduct = async (req, res) => {
    try {
        const {
            productId,
            reason,
            reasonDescription,
            quantity,
            location,
            approvedBy,
            notes
        } = req.body;

        // Validate required fields
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Quarantine reason is required'
            });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is already quarantined
        const existingQuarantine = await Quarantine.findOne({
            productId: productId,
            status: 'quarantined'
        });

        if (existingQuarantine) {
            return res.status(400).json({
                success: false,
                message: 'Product is already quarantined'
            });
        }

        // Determine quantity to quarantine
        const qtyToQuarantine = parseInt(quantity) || product.quantityOnHand;
        if (qtyToQuarantine > product.quantityOnHand) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${product.quantityOnHand}`
            });
        }

        if (qtyToQuarantine <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        // Get user name
        const userName = req.user?.firstName && req.user?.lastName
            ? req.user.firstName + ' ' + req.user.lastName
            : req.user?.firstName || req.user?.email || 'System User';

        // Save the current stock before quarantine
        const previousStock = product.quantityOnHand || 0;
        const newStock = previousStock - qtyToQuarantine;

        // Create quarantine record
        const quarantine = new Quarantine({
            productId: product._id,
            productName: product.name,
            productCode: product.code || '',
            batchNumber: product.batchNumber || '',
            strength: product.strength || '',
            dosageForm: product.dosageForm || '',
            supplier: product.supplier || '',
            quarantineDate: new Date(),
            reason: reason,
            reasonDescription: reasonDescription || '',
            quantity: qtyToQuarantine,
            expiryDate: product.expiryDate,
            location: location || 'Quarantine Area',
            quarantinedBy: req.user?.firstName && req.user?.lastName ? req.user.firstName + " " + req.user.lastName : req.user?.firstName || req.user?.email || "System User",
            quarantinedById: req.user?.id,
            approvedBy: approvedBy || userName,
            notes: notes || '',
            status: 'quarantined',
            history: [{
                action: 'quarantined',
                date: new Date(),
                performedBy: userName,
                details: `Product quarantined due to ${reason}${reasonDescription ? ': ' + reasonDescription : ''}`
            }]
        });

        await quarantine.save();

        // Update product stock - remove quarantined quantity
        product.quantityOnHand = newStock;
        product.isQuarantined = true;
        await product.save();

        // Log transaction
        try {
            const transaction = new StockTransaction({
                productId: product._id,
                productName: product.name,
                type: 'adjustment',
                quantity: qtyToQuarantine,
                previousStock: previousStock,
                newStock: newStock,
                batchNumber: product.batchNumber || '',
                remarks: `QUARANTINED: ${qtyToQuarantine} units - ${reason}${reasonDescription ? ': ' + reasonDescription : ''}`,
                receivedBy: userName,
                expiryDate: product.expiryDate
            });
            await transaction.save();
        } catch (txError) {
            console.error('Transaction error:', txError);
            // Don't fail the quarantine if transaction logging fails
        }

        res.status(201).json({
            success: true,
            message: 'Product quarantined successfully',
            data: quarantine
        });

    } catch (error) {
        console.error('Quarantine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error quarantining product: ' + error.message
        });
    }
};

// ============================================================
// RELEASE PRODUCT FROM QUARANTINE
// ============================================================
exports.releaseFromQuarantine = async (req, res) => {
    try {
        const { id } = req.params;
        const { releaseReason, releaseNotes } = req.body;

        const quarantine = await Quarantine.findById(id);
        if (!quarantine) {
            return res.status(404).json({
                success: false,
                message: 'Quarantine record not found'
            });
        }

        if (quarantine.status !== 'quarantined') {
            return res.status(400).json({
                success: false,
                message: `Product is already ${quarantine.status}`
            });
        }

        const product = await Product.findById(quarantine.productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const userName = req.user?.firstName && req.user?.lastName
            ? req.user.firstName + ' ' + req.user.lastName
            : req.user?.firstName || req.user?.email || 'System User';

        // Save current stock before release
        const previousStock = product.quantityOnHand || 0;
        const newStock = previousStock + quarantine.quantity;

        // Update quarantine status
        quarantine.status = 'cleared';
        quarantine.dispositionDate = new Date();
        quarantine.dispositionAction = 'cleared';
        quarantine.dispositionReason = releaseReason || 'Product cleared for use';
        quarantine.reviewedBy = userName;
        quarantine.reviewDate = new Date();
        quarantine.reviewNotes = releaseNotes || '';
        quarantine.history.push({
            action: 'released',
            date: new Date(),
            performedBy: userName,
            details: `Product released from quarantine - ${releaseReason || 'Cleared'}`
        });

        await quarantine.save();

        // Return stock to product
        product.quantityOnHand = newStock;
        product.isQuarantined = false;
        await product.save();

        // Log transaction
        try {
            const transaction = new StockTransaction({
                productId: product._id,
                productName: product.name,
                type: 'adjustment',
                quantity: quarantine.quantity,
                previousStock: previousStock,
                newStock: newStock,
                batchNumber: product.batchNumber || '',
                remarks: `RELEASED FROM QUARANTINE: +${quarantine.quantity} units - ${releaseReason || ''}`,
                receivedBy: userName,
                expiryDate: product.expiryDate
            });
            await transaction.save();
        } catch (txError) {
            console.error('Transaction error:', txError);
        }

        res.json({
            success: true,
            message: 'Product released from quarantine',
            data: quarantine
        });

    } catch (error) {
        console.error('Release error:', error);
        res.status(500).json({
            success: false,
            message: 'Error releasing product: ' + error.message
        });
    }
};

// ============================================================
// DISPOSE QUARANTINED PRODUCT
// ============================================================
exports.disposeQuarantined = async (req, res) => {
    try {
        const { id } = req.params;
        const { disposalMethod, disposalNotes } = req.body;

        const quarantine = await Quarantine.findById(id);
        if (!quarantine) {
            return res.status(404).json({
                success: false,
                message: 'Quarantine record not found'
            });
        }

        if (quarantine.status !== 'quarantined') {
            return res.status(400).json({
                success: false,
                message: `Product is already ${quarantine.status}`
            });
        }

        const userName = req.user?.firstName && req.user?.lastName
            ? req.user.firstName + ' ' + req.user.lastName
            : req.user?.firstName || req.user?.email || 'System User';

        // Update quarantine status
        quarantine.status = 'destroyed';
        quarantine.dispositionDate = new Date();
        quarantine.dispositionAction = 'destroyed';
        quarantine.dispositionReason = disposalMethod || 'Product disposed';
        quarantine.disposedBy = userName;
        quarantine.history.push({
            action: 'disposed',
            date: new Date(),
            performedBy: userName,
            details: `Product disposed - ${disposalMethod || ''}${disposalNotes ? ': ' + disposalNotes : ''}`
        });

        await quarantine.save();

        // Remove from product (stock already removed when quarantined)
        const product = await Product.findById(quarantine.productId);
        if (product) {
            product.isQuarantined = false;
            await product.save();
        }

        res.json({
            success: true,
            message: 'Product disposed successfully',
            data: quarantine
        });

    } catch (error) {
        console.error('Dispose error:', error);
        res.status(500).json({
            success: false,
            message: 'Error disposing product: ' + error.message
        });
    }
};

// ============================================================
// GET QUARANTINE BY ID
// ============================================================
exports.getQuarantineById = async (req, res) => {
    try {
        const { id } = req.params;
        const quarantine = await Quarantine.findById(id).populate('productId', 'name code strength batchNumber supplier');
        
        if (!quarantine) {
            return res.status(404).json({
                success: false,
                message: 'Quarantine record not found'
            });
        }

        res.json({
            success: true,
            data: quarantine
        });

    } catch (error) {
        console.error('Get quarantine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quarantine record'
        });
    }
};

// ============================================================
// GET QUARANTINE STATISTICS
// ============================================================
exports.getQuarantineStats = async (req, res) => {
    try {
        const totalQuarantined = await Quarantine.countDocuments({ status: 'quarantined' });
        const totalCleared = await Quarantine.countDocuments({ status: 'cleared' });
        const totalDestroyed = await Quarantine.countDocuments({ status: 'destroyed' });
        const totalReturned = await Quarantine.countDocuments({ status: 'returned' });

        const recent = await Quarantine.find({ status: 'quarantined' })
            .sort({ quarantineDate: -1 })
            .limit(5)
            .populate('productId', 'name code');

        const reasons = await Quarantine.aggregate([
            { $match: { status: 'quarantined' } },
            { $group: { _id: '$reason', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalQuarantined,
                totalCleared,
                totalDestroyed,
                totalReturned,
                recent,
                reasons
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quarantine statistics'
        });
    }
};
