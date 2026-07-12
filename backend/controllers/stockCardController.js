const StockCard = require('../models/StockCard');
const Product = require('../models/Product');

// ============================================================
// GET STOCK CARD FOR A PRODUCT
// ============================================================
exports.getStockCard = async (req, res) => {
    try {
        const { productId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;
        
        let query = { productId };
        
        if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }
        if (endDate) {
            query.date = { ...query.date, $lte: new Date(endDate) };
        }
        
        const transactions = await StockCard.find(query)
            .sort({ date: 1 })
            .limit(parseInt(limit));
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                product: {
                    name: product.name,
                    strength: product.strength,
                    dosageForm: product.dosageForm,
                    code: product.code,
                    unitOfIssue: 'Each',
                    currentStock: product.quantityOnHand
                },
                transactions: transactions,
                total: transactions.length
            }
        });
    } catch (error) {
        console.error('Get stock card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock card: ' + error.message
        });
    }
};

// ============================================================
// ADD TRANSACTION TO STOCK CARD
// ============================================================
exports.addTransaction = async (req, res) => {
    try {
        const {
            productId,
            date,
            dnoteNumber,
            referenceNumber,
            issuedTo,
            receivedFrom,
            quantityReceived,
            batchNumber,
            expiryDate,
            quantityIssued,
            losses,
            positiveAdjustment,
            negativeAdjustment,
            quantityOnHand,
            transactionType,
            remarks,
            isSpotCheck,
            isPhysicalInventory,
            physicalCount
        } = req.body;
        
        const userName = req.user?.firstName && req.user?.lastName
            ? req.user.firstName + ' ' + req.user.lastName
            : req.user?.firstName || req.user?.email || 'System User';
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        let variance = 0;
        let isVerified = false;
        
        if (isSpotCheck || isPhysicalInventory) {
            variance = physicalCount - product.quantityOnHand;
            isVerified = variance === 0;
        }
        
        const stockCard = new StockCard({
            productId,
            productName: product.name,
            strength: product.strength || '',
            dosageForm: product.dosageForm || '',
            productCode: product.code || '',
            unitOfIssue: 'Each',
            date: date || new Date(),
            dnoteNumber,
            referenceNumber,
            issuedTo,
            receivedFrom,
            quantityReceived: quantityReceived || 0,
            batchNumber,
            expiryDate,
            quantityIssued: quantityIssued || 0,
            losses: losses || 0,
            positiveAdjustment: positiveAdjustment || 0,
            negativeAdjustment: negativeAdjustment || 0,
            quantityOnHand,
            transactionType,
            transactingOfficer: userName,
            officerId: req.user?.id,
            remarks: remarks || '',
            isSpotCheck: isSpotCheck || false,
            isPhysicalInventory: isPhysicalInventory || false,
            physicalCount: physicalCount || 0,
            variance: variance,
            isVerified: isVerified,
            isMonthEnd: isPhysicalInventory || false
        });
        
        await stockCard.save();
        
        res.status(201).json({
            success: true,
            message: 'Transaction added to stock card',
            data: stockCard
        });
    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding transaction: ' + error.message
        });
    }
};

// ============================================================
// SPOT CHECK
// ============================================================
exports.spotCheck = async (req, res) => {
    try {
        const { productId, physicalCount, remarks } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const variance = physicalCount - product.quantityOnHand;
        const isVerified = variance === 0;
        const userName = req.user?.firstName && req.user?.lastName
            ? req.user.firstName + ' ' + req.user.lastName
            : req.user?.firstName || req.user?.email || 'System User';
        
        // Create spot check entry - YELLOW (indicated by isSpotCheck: true)
        const spotCheck = new StockCard({
            productId: product._id,
            productName: product.name,
            strength: product.strength || '',
            dosageForm: product.dosageForm || '',
            productCode: product.code || '',
            unitOfIssue: 'Each',
            date: new Date(),
            quantityOnHand: product.quantityOnHand,
            transactionType: 'spot-check',
            transactingOfficer: userName,
            officerId: req.user?.id,
            remarks: remarks || `SPOT CHECK: System: ${product.quantityOnHand}, Physical: ${physicalCount}, Variance: ${variance}`,
            isSpotCheck: true,
            physicalCount: physicalCount,
            variance: variance,
            isVerified: isVerified,
            spotCheckDate: new Date()
        });
        
        await spotCheck.save();
        
        // If variance is not zero, create adjustment
        if (variance !== 0) {
            const adjustmentType = variance > 0 ? 'positive' : 'negative';
            const adjustmentQuantity = Math.abs(variance);
            
            const adjustmentCard = new StockCard({
                productId: product._id,
                productName: product.name,
                strength: product.strength || '',
                dosageForm: product.dosageForm || '',
                productCode: product.code || '',
                unitOfIssue: 'Each',
                date: new Date(),
                quantityOnHand: physicalCount,
                transactionType: adjustmentType === 'positive' ? 'adjustment-positive' : 'adjustment-negative',
                positiveAdjustment: adjustmentType === 'positive' ? adjustmentQuantity : 0,
                negativeAdjustment: adjustmentType === 'negative' ? adjustmentQuantity : 0,
                transactingOfficer: userName,
                officerId: req.user?.id,
                remarks: `SPOT CHECK ADJUSTMENT: ${adjustmentType.toUpperCase()} ${adjustmentQuantity} units to match physical count`,
                isSpotCheck: true
            });
            
            await adjustmentCard.save();
            
            // Update product stock
            product.quantityOnHand = physicalCount;
            await product.save();
        }
        
        res.json({
            success: true,
            message: `Spot check completed. Variance: ${variance}`,
            data: {
                product: product.name,
                systemStock: product.quantityOnHand,
                physicalCount,
                variance,
                isVerified,
                isSpotCheck: true
            }
        });
    } catch (error) {
        console.error('Spot check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing spot check: ' + error.message
        });
    }
};

// ============================================================
// PHYSICAL INVENTORY (Month End - RED)
// ============================================================
exports.physicalInventory = async (req, res) => {
    try {
        const { productId, physicalCount, remarks } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const variance = physicalCount - product.quantityOnHand;
        const isVerified = variance === 0;
        const userName = req.user?.firstName && req.user?.lastName
            ? req.user.firstName + ' ' + req.user.lastName
            : req.user?.firstName || req.user?.email || 'System User';
        
        // Create physical inventory entry - RED (indicated by isPhysicalInventory: true)
        const physicalInv = new StockCard({
            productId: product._id,
            productName: product.name,
            strength: product.strength || '',
            dosageForm: product.dosageForm || '',
            productCode: product.code || '',
            unitOfIssue: 'Each',
            date: new Date(),
            quantityOnHand: product.quantityOnHand,
            transactionType: 'physical-inventory',
            transactingOfficer: userName,
            officerId: req.user?.id,
            remarks: remarks || `PHYSICAL INVENTORY: System: ${product.quantityOnHand}, Physical: ${physicalCount}, Variance: ${variance}`,
            isPhysicalInventory: true,
            isMonthEnd: true,
            physicalCount: physicalCount,
            variance: variance,
            isVerified: isVerified
        });
        
        await physicalInv.save();
        
        // If variance is not zero, create adjustment
        if (variance !== 0) {
            const adjustmentType = variance > 0 ? 'positive' : 'negative';
            const adjustmentQuantity = Math.abs(variance);
            
            const adjustmentCard = new StockCard({
                productId: product._id,
                productName: product.name,
                strength: product.strength || '',
                dosageForm: product.dosageForm || '',
                productCode: product.code || '',
                unitOfIssue: 'Each',
                date: new Date(),
                quantityOnHand: physicalCount,
                transactionType: adjustmentType === 'positive' ? 'adjustment-positive' : 'adjustment-negative',
                positiveAdjustment: adjustmentType === 'positive' ? adjustmentQuantity : 0,
                negativeAdjustment: adjustmentType === 'negative' ? adjustmentQuantity : 0,
                transactingOfficer: userName,
                officerId: req.user?.id,
                remarks: `PHYSICAL INVENTORY ADJUSTMENT: ${adjustmentType.toUpperCase()} ${adjustmentQuantity} units`,
                isPhysicalInventory: true,
                isMonthEnd: true
            });
            
            await adjustmentCard.save();
            
            // Update product stock
            product.quantityOnHand = physicalCount;
            await product.save();
        }
        
        res.json({
            success: true,
            message: `Physical inventory recorded. Variance: ${variance}`,
            data: {
                product: product.name,
                systemStock: product.quantityOnHand,
                physicalCount,
                variance,
                isVerified,
                isPhysicalInventory: true
            }
        });
    } catch (error) {
        console.error('Physical inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording physical inventory: ' + error.message
        });
    }
};

// ============================================================
// GET SPOT CHECK HISTORY
// ============================================================
exports.getSpotCheckHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const spotChecks = await StockCard.find({
            productId: productId,
            isSpotCheck: true
        }).sort({ date: -1 });
        
        res.json({
            success: true,
            data: spotChecks,
            total: spotChecks.length
        });
    } catch (error) {
        console.error('Get spot check history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching spot check history'
        });
    }
};

// ============================================================
// GET PHYSICAL INVENTORY HISTORY
// ============================================================
exports.getPhysicalInventoryHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const physicalInventories = await StockCard.find({
            productId: productId,
            isPhysicalInventory: true
        }).sort({ date: -1 });
        
        res.json({
            success: true,
            data: physicalInventories,
            total: physicalInventories.length
        });
    } catch (error) {
        console.error('Get physical inventory history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching physical inventory history'
        });
    }
};

// ============================================================
// GET MONTH END REPORT
// ============================================================
exports.getMonthEndReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0);
        
        const transactions = await StockCard.find({
            date: { $gte: startDate, $lte: endDate },
            isPhysicalInventory: true
        });
        
        const summary = transactions.map(t => ({
            productName: t.productName,
            code: t.productCode,
            systemStock: t.quantityOnHand,
            physicalCount: t.physicalCount,
            variance: t.variance,
            isVerified: t.isVerified
        }));
        
        res.json({
            success: true,
            data: {
                month: targetMonth,
                year: targetYear,
                transactions,
                summary,
                totalProducts: transactions.length,
                verifiedCount: transactions.filter(t => t.isVerified).length,
                varianceCount: transactions.filter(t => t.variance !== 0).length
            }
        });
    } catch (error) {
        console.error('Month end report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating month end report'
        });
    }
};

