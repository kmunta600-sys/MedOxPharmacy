const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// ============================================================
// GET DASHBOARD STATS - FIXED
// ============================================================
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        // Get all active products
        const products = await Product.find({ isActive: true });
        const totalProducts = products.length;
        
        // Calculate low stock and critical stock using JavaScript
        let lowStockCount = 0;
        let criticalStockCount = 0;
        const criticalProducts = [];
        const lowProducts = [];
        
        products.forEach(p => {
            const stock = p.quantityOnHand || 0;
            const minStock = p.minStock || 50;
            
            if (stock < 10) {
                criticalStockCount++;
                criticalProducts.push({
                    name: p.name,
                    strength: p.strength || '',
                    quantityOnHand: stock,
                    minStock: minStock
                });
            } else if (stock <= minStock) {
                lowStockCount++;
                lowProducts.push({
                    name: p.name,
                    strength: p.strength || '',
                    quantityOnHand: stock,
                    minStock: minStock
                });
            }
        });

        // Get recent transactions
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log(`   Total products: ${totalProducts}`);
        console.log(`   Low stock: ${lowStockCount}`);
        console.log(`   Critical stock: ${criticalStockCount}`);
        console.log(`   Recent transactions: ${recentTransactions.length}`);

        res.json({
            success: true,
            data: {
                totalProducts,
                lowStock: lowStockCount,
                criticalStock: criticalStockCount,
                recentTransactions: recentTransactions.map(t => ({
                    id: t._id,
                    product: t.productName || 'Unknown',
                    type: t.type || 'unknown',
                    qty: t.quantity || 0,
                    date: t.createdAt ? t.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    from: t.from || '',
                    to: t.to || ''
                })),
                alerts: {
                    critical: criticalProducts,
                    low: lowProducts
                }
            }
        });

    } catch (error) {
        console.error('❌ Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================================
// GET SINGLE PRODUCT
// ============================================================
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================================
// CREATE PRODUCT
// ============================================================
exports.createProduct = async (req, res) => {
    try {
        console.log('📦 Creating product...');
        console.log('   User:', req.user.email);
        console.log('   Request body:', req.body);

        const {
            name, strength, code, category, dosageForm, unitOfIssue,
            batch, qtyReceived, qtyOnHand, expiry,
            batchNumber, quantityReceived, quantityOnHand, expiryDate,
            dNote, supplier,
            minStock, maxStock, unitCost, sellingPrice
        } = req.body;

        if (!name || !strength || !category || !dosageForm || !unitOfIssue) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        const finalBatchNumber = batch || batchNumber || '';
        const finalQtyReceived = qtyReceived || quantityReceived || 0;
        const finalQtyOnHand = qtyOnHand || quantityOnHand || 0;
        const finalExpiryDate = expiry || expiryDate || null;

        const productData = {
            name,
            strength,
            category,
            dosageForm,
            unitOfIssue,
            dNote: dNote || '',
            batchNumber: finalBatchNumber,
            quantityReceived: finalQtyReceived,
            quantityOnHand: finalQtyOnHand,
            expiryDate: finalExpiryDate,
            supplier: supplier || '',
            minStock: minStock || 50,
            maxStock: maxStock || 500,
            unitCost: unitCost || 0,
            sellingPrice: sellingPrice || 0,
            createdBy: req.user.id
        };

        if (code) {
            productData.code = code;
        }

        console.log('   Product data:', productData);

        const product = new Product(productData);
        await product.save();

        console.log('   ✅ Product created:', product.name, product.code);

        const transaction = new Transaction({
            product: product._id,
            productName: `${product.name} ${product.strength || ''}`,
            type: 'received',
            quantity: product.quantityReceived || 0,
            batchNumber: product.batchNumber,
            expiryDate: product.expiryDate,
            from: product.supplier,
            reference: product.dNote,
            remarks: 'Initial stock entry',
            officer: `${req.user.firstName} ${req.user.lastName}`,
            userId: req.user.id,
            previousStock: 0,
            newStock: product.quantityOnHand || 0
        });
        await transaction.save();

        console.log('   ✅ Transaction created');

        res.status(201).json({
            success: true,
            message: 'Product added successfully!',
            data: product
        });

    } catch (error) {
        console.error('❌ Create product error:', error.message);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product code already exists. Please use a different code.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================================
// DELETE PRODUCT
// ============================================================
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.isActive = false;
        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};



