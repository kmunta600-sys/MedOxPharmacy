const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// ============================================================
// CREATE TRANSACTION (Receive, Issue, Loss, Adjustment)
// ============================================================
exports.createTransaction = async (req, res) => {
    try {
        console.log('📦 Creating transaction...');
        console.log('   User:', req.user.email);
        console.log('   Data:', req.body);

        const { 
            productId, 
            type, 
            quantity, 
            batchNumber, 
            expiryDate, 
            from, 
            to, 
            remarks, 
            reference 
        } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate quantity
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        // For issue/loss, check if enough stock
        if ((type === 'issued' || type === 'loss') && quantity > (product.quantityOnHand || 0)) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${product.quantityOnHand || 0}`
            });
        }

        // Calculate new stock
        let newStock = product.quantityOnHand || 0;
        if (type === 'received' || type === 'adjustment') {
            newStock += quantity;
        } else if (type === 'issued' || type === 'loss') {
            newStock -= quantity;
        }

        console.log(`   📊 Stock: ${product.quantityOnHand} → ${newStock}`);

        // Create transaction
        const transaction = new Transaction({
            product: productId,
            productName: `${product.name} ${product.strength || ''}`.trim(),
            type,
            quantity,
            batchNumber: batchNumber || '',
            expiryDate: expiryDate || null,
            from: from || '',
            to: to || '',
            remarks: remarks || '',
            reference: reference || '',
            officer: `${req.user.firstName} ${req.user.lastName}`,
            userId: req.user.id,
            previousStock: product.quantityOnHand || 0,
            newStock: newStock
        });

        await transaction.save();
        console.log('   ✅ Transaction saved');

        // Update product stock
        product.quantityOnHand = newStock;
        await product.save();
        console.log('   ✅ Product stock updated');

        // Get updated product
        const updatedProduct = await Product.findById(productId);

        res.status(201).json({
            success: true,
            message: 'Transaction recorded successfully',
            data: {
                transaction,
                product: updatedProduct
            }
        });

    } catch (error) {
        console.error('❌ Transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// ============================================================
// GET PRODUCT TRANSACTIONS (Stock Card)
// ============================================================
exports.getProductTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ product: req.params.productId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================================
// GET ALL TRANSACTIONS
// ============================================================
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('product', 'name strength code');

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });

    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
