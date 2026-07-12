const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const PDFService = require('../services/pdfService');

// StockTransaction Schema
let StockTransaction;
try {
    StockTransaction = require('../models/StockTransaction');
} catch (e) {
    const transactionSchema = new mongoose.Schema({
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        type: { type: String, enum: ['receive', 'dispense', 'adjustment', 'return'], required: true },
        quantity: { type: Number, required: true },
        previousStock: { type: Number, required: true },
        newStock: { type: Number, required: true },
        batchNumber: { type: String },
        dnoteNumber: { type: String },
        supplier: { type: String },
        expiryDate: { type: Date },
        remarks: { type: String },
        receivedBy: { type: String, default: 'system' },
        createdAt: { type: Date, default: Date.now }
    });
    StockTransaction = mongoose.model('StockTransaction', transactionSchema);
}

// Import StockCard Model
const StockCard = require('../models/StockCard');

// ============================================================
// HELPER: Get User Name from Request
// ============================================================
function getUserName(req) {
    // Try to get full name
    if (req.user?.firstName && req.user?.lastName) {
        return req.user.firstName + ' ' + req.user.lastName;
    }
    // Try first name only
    if (req.user?.firstName) {
        return req.user.firstName;
    }
    // Try email
    if (req.user?.email) {
        return req.user.email;
    }
    // Default
    return 'System User';
}

// ============================================================
// HELPER: Record to Stock Card
// ============================================================
async function recordToStockCard(product, transactionType, quantity, previousStock, newStock, remarks, user, batchNumber, expiryDate, dnoteNumber, referenceNumber, issuedTo, receivedFrom) {
    try {
        // Determine which field to populate based on transaction type
        let quantityReceived = 0;
        let quantityIssued = 0;
        let losses = 0;
        let positiveAdjustment = 0;
        let negativeAdjustment = 0;
        
        switch(transactionType) {
            case 'receive':
                quantityReceived = quantity;
                break;
            case 'dispense':
                quantityIssued = quantity;
                break;
            case 'loss':
                losses = quantity;
                break;
            case 'adjustment-positive':
                positiveAdjustment = quantity;
                break;
            case 'adjustment-negative':
                negativeAdjustment = quantity;
                break;
            default:
                quantityReceived = 0;
        }
        
        // Use the provided user or fallback to 'System User'
        const officerName = user && user !== '' ? user : 'System User';
        
        const stockCard = new StockCard({
            productId: product._id,
            productName: product.name,
            strength: product.strength || '',
            dosageForm: product.dosageForm || '',
            productCode: product.code || '',
            unitOfIssue: 'Each',
            date: new Date(),
            dnoteNumber: dnoteNumber || '',
            referenceNumber: referenceNumber || '',
            issuedTo: issuedTo || '',
            receivedFrom: receivedFrom || '',
            quantityReceived: quantityReceived,
            quantityIssued: quantityIssued,
            losses: losses,
            positiveAdjustment: positiveAdjustment,
            negativeAdjustment: negativeAdjustment,
            batchNumber: batchNumber || product.batchNumber || '',
            expiryDate: expiryDate || product.expiryDate,
            quantityOnHand: newStock,
            transactionType: transactionType,
            transactingOfficer: officerName,
            officerId: null,
            remarks: remarks || '',
            isMonthEnd: false
        });
        await stockCard.save();
        console.log(`✅ Stock Card recorded: ${product.name} - ${transactionType} - ${quantity} units (Stock: ${previousStock} → ${newStock}) by ${officerName}`);
    } catch (error) {
        console.error('❌ Stock Card recording error:', error);
    }
}

// ============================================================
// SUPPLIER ROUTES
// ============================================================

router.get('/suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching suppliers' });
    }
});

router.post('/suppliers', async (req, res) => {
    try {
        const { name } = req.body;
        const existing = await Supplier.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Supplier already exists', data: existing });
        }
        const supplier = new Supplier({ name });
        await supplier.save();
        res.json({ success: true, message: 'Supplier created', data: supplier });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating supplier' });
    }
});

router.delete('/suppliers/:id', async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting supplier' });
    }
});

router.put('/suppliers/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, message: 'Supplier updated', data: supplier });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating supplier' });
    }
});

// ============================================================
// RECEIVE STOCK - WITH OFFICER TRACKING (ADDED auth)
// ============================================================

router.post('/receive', auth, async (req, res) => {
    console.log('📦 Receive request:', req.body);
    
    try {
        const { items, dnoteNumber, supplier, supplierId, receiveDate, remarks } = req.body;
        const userName = getUserName(req);

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items to receive' });
        }

        const receivedItems = [];
        const errors = [];
        let supplierDoc = null;

        try {
            if (supplierId) {
                supplierDoc = await Supplier.findById(supplierId);
            }
            if (!supplierDoc) {
                supplierDoc = await Supplier.findOne({ name: { $regex: new RegExp('^' + supplier + '$', 'i') } });
            }
            if (!supplierDoc) {
                supplierDoc = new Supplier({ name: supplier });
                await supplierDoc.save();
            }
        } catch (err) {
            console.error('Supplier error:', err);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            try {
                if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                    errors.push(`Item ${i + 1}: Invalid product ID`);
                    continue;
                }

                const product = await Product.findById(item.productId);
                if (!product) {
                    errors.push(`Item ${i + 1}: Product not found`);
                    continue;
                }

                if (item.expiryDate) {
                    const expiryDate = new Date(item.expiryDate);
                    if (expiryDate < today) {
                        errors.push(`Item ${i + 1}: ${product.name} - EXPIRED - Cannot receive`);
                        continue;
                    }
                }

                const quantity = parseInt(item.quantity) || 0;
                if (quantity <= 0) {
                    errors.push(`Item ${i + 1}: Invalid quantity`);
                    continue;
                }

                const previousStock = product.quantityOnHand || 0;
                product.quantityOnHand = previousStock + quantity;

                if (item.batchNumber) product.batchNumber = item.batchNumber;
                if (dnoteNumber) product.dnoteNumber = dnoteNumber;
                if (supplier) product.supplier = supplier;
                if (item.expiryDate) product.expiryDate = new Date(item.expiryDate);

                await product.save();

                // RECORD TO STOCK CARD with officer name
                await recordToStockCard(
                    product,
                    'receive',
                    quantity,
                    previousStock,
                    product.quantityOnHand,
                    `Received ${quantity} units - ${remarks || ''}`,
                    userName,
                    item.batchNumber || product.batchNumber,
                    item.expiryDate || product.expiryDate,
                    dnoteNumber || '',
                    '',
                    '',
                    supplier || ''
                );

                receivedItems.push({
                    productId: product._id,
                    productName: product.name,
                    quantity: quantity,
                    newStock: product.quantityOnHand
                });

            } catch (error) {
                errors.push(`Item ${i + 1}: ${error.message}`);
            }
        }

        res.json({
            success: errors.length === 0,
            data: {
                dnoteNumber,
                supplier,
                received: receivedItems,
                errors: errors.length > 0 ? errors : undefined,
                totalReceived: receivedItems.length,
                totalErrors: errors.length
            },
            message: errors.length === 0 
                ? `Successfully received ${receivedItems.length} item(s)`
                : receivedItems.length > 0 
                    ? `Partially successful: ${receivedItems.length} item(s) received, ${errors.length} error(s)`
                    : `Failed to receive items. ${errors.length} error(s)`
        });

    } catch (error) {
        console.error('Receive error:', error);
        res.status(500).json({ success: false, message: 'Error receiving stock: ' + error.message });
    }
});

// ============================================================
// DISPENSE STOCK (FEFO) - WITH OFFICER TRACKING (ADDED auth)
// ============================================================

router.post('/dispense', auth, async (req, res) => {
    console.log('📤 Dispense request:', req.body);
    
    try {
        const { items, prescriptionNumber, patientName, prescriber } = req.body;
        const userName = getUserName(req);

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items to dispense' });
        }

        const dispensedItems = [];
        const errors = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            try {
                if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                    errors.push(`Item ${i + 1}: Invalid product ID`);
                    continue;
                }

                const requestedProduct = await Product.findById(item.productId);
                if (!requestedProduct) {
                    errors.push(`Item ${i + 1}: Product not found`);
                    continue;
                }

                // Check if product is quarantined
                if (requestedProduct.isQuarantined) {
                    errors.push(`Item ${i + 1}: ${requestedProduct.name} - QUARANTINED - Cannot dispense`);
                    continue;
                }

                if (requestedProduct.expiryDate && new Date(requestedProduct.expiryDate) < today) {
                    errors.push(`Item ${i + 1}: ${requestedProduct.name} - EXPIRED - Cannot dispense`);
                    continue;
                }

                const requestedQuantity = parseInt(item.quantity) || 0;
                if (requestedQuantity <= 0) {
                    errors.push(`Item ${i + 1}: Invalid quantity`);
                    continue;
                }

                if (requestedQuantity <= requestedProduct.quantityOnHand) {
                    const previousStock = requestedProduct.quantityOnHand || 0;
                    requestedProduct.quantityOnHand = previousStock - requestedQuantity;
                    await requestedProduct.save();

                    await recordToStockCard(
                        requestedProduct,
                        'dispense',
                        requestedQuantity,
                        previousStock,
                        requestedProduct.quantityOnHand,
                        `Dispensed ${requestedQuantity} units to ${patientName || 'Unknown'} - ${prescriptionNumber || ''}`,
                        userName,
                        requestedProduct.batchNumber || '',
                        requestedProduct.expiryDate,
                        prescriptionNumber || '',
                        '',
                        patientName || '',
                        ''
                    );

                    dispensedItems.push({
                        productId: requestedProduct._id,
                        productName: requestedProduct.name,
                        batchNumber: requestedProduct.batchNumber || '',
                        quantity: requestedQuantity,
                        newStock: requestedProduct.quantityOnHand
                    });
                } else {
                    const allBatches = await Product.find({ 
                        name: requestedProduct.name 
                    }).sort({ expiryDate: 1 });
                    
                    const validBatches = allBatches.filter(p => {
                        if (!p.expiryDate) return true;
                        return new Date(p.expiryDate) >= today;
                    });
                    
                    if (validBatches.length === 0) {
                        errors.push(`Item ${i + 1}: No valid batches available for ${requestedProduct.name}`);
                        continue;
                    }
                    
                    let remainingToDispense = requestedQuantity;
                    
                    for (const batch of validBatches) {
                        if (remainingToDispense <= 0) break;
                        if (batch.quantityOnHand > 0) {
                            const takeFromBatch = Math.min(batch.quantityOnHand, remainingToDispense);
                            const previousStock = batch.quantityOnHand || 0;
                            batch.quantityOnHand = previousStock - takeFromBatch;
                            await batch.save();
                            remainingToDispense -= takeFromBatch;
                            
                            await recordToStockCard(
                                batch,
                                'dispense',
                                takeFromBatch,
                                previousStock,
                                batch.quantityOnHand,
                                `Dispensed ${takeFromBatch} units (FEFO) to ${patientName || 'Unknown'} - ${prescriptionNumber || ''}`,
                                userName,
                                batch.batchNumber || '',
                                batch.expiryDate,
                                prescriptionNumber || '',
                                '',
                                patientName || '',
                                ''
                            );
                            
                            dispensedItems.push({
                                productId: batch._id,
                                productName: batch.name,
                                batchNumber: batch.batchNumber || '',
                                quantity: takeFromBatch,
                                newStock: batch.quantityOnHand
                            });
                        }
                    }
                    
                    if (remainingToDispense > 0) {
                        errors.push(`Item ${i + 1}: Insufficient total stock for ${requestedProduct.name}`);
                    }
                }

            } catch (error) {
                errors.push(`Item ${i + 1}: ${error.message}`);
            }
        }

        res.json({
            success: errors.length === 0,
            data: {
                prescriptionNumber,
                patientName,
                dispensed: dispensedItems,
                errors: errors.length > 0 ? errors : undefined,
                totalDispensed: dispensedItems.length,
                totalErrors: errors.length
            },
            message: errors.length === 0 
                ? `Successfully dispensed ${dispensedItems.length} item(s)`
                : dispensedItems.length > 0 
                    ? `Partially successful: ${dispensedItems.length} item(s) dispensed, ${errors.length} error(s)`
                    : `Failed to dispense items. ${errors.length} error(s)`
        });

    } catch (error) {
        console.error('Dispense error:', error);
        res.status(500).json({ success: false, message: 'Error dispensing stock: ' + error.message });
    }
});

// ============================================================
// STOCK ADJUSTMENT - WITH OFFICER TRACKING
// ============================================================

router.post('/adjust', auth, async (req, res) => {
    console.log('⚡ Adjustment request:', req.body);
    console.log('👤 User:', req.user);
    
    try {
        const { items, adjustmentType, referenceNumber, approvedBy, remarks, facilityName, facilityContact } = req.body;
        const userName = getUserName(req);

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items to adjust' });
        }

        if (!adjustmentType || !['positive', 'negative', 'loss'].includes(adjustmentType)) {
            return res.status(400).json({ success: false, message: 'Valid adjustment type is required (positive, negative, loss)' });
        }

        if (!referenceNumber || referenceNumber.trim() === '') {
            return res.status(400).json({ success: false, message: 'Reference number is required' });
        }

        if (!approvedBy || approvedBy.trim() === '') {
            return res.status(400).json({ success: false, message: 'Approved by is required' });
        }

        const adjustedItems = [];
        const errors = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            try {
                if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                    errors.push(`Item ${i + 1}: Invalid product ID`);
                    continue;
                }

                const product = await Product.findById(item.productId);
                if (!product) {
                    errors.push(`Item ${i + 1}: Product not found`);
                    continue;
                }

                if (product.isQuarantined) {
                    errors.push(`Item ${i + 1}: ${product.name} - QUARANTINED - Cannot adjust. Please release from quarantine first.`);
                    continue;
                }

                const quantity = parseInt(item.quantity) || 0;
                if (quantity <= 0) {
                    errors.push(`Item ${i + 1}: Invalid quantity`);
                    continue;
                }

                // POSITIVE ADJUSTMENT
                if (adjustmentType === 'positive') {
                    const previousStock = product.quantityOnHand || 0;
                    product.quantityOnHand = previousStock + quantity;
                    await product.save();

                    await recordToStockCard(
                        product,
                        'adjustment-positive',
                        quantity,
                        previousStock,
                        product.quantityOnHand,
                        `POSITIVE Adjustment: +${quantity} - ${remarks || ''}`,
                        userName,
                        item.batchNumber || product.batchNumber,
                        item.expiryDate || product.expiryDate,
                        '',
                        referenceNumber,
                        '',
                        ''
                    );

                    adjustedItems.push({
                        productId: product._id,
                        productName: product.name,
                        quantity: quantity,
                        previousStock: previousStock,
                        newStock: product.quantityOnHand,
                        adjustmentType: 'positive',
                        batchNumber: product.batchNumber || '',
                        expiryDate: product.expiryDate
                    });
                    
                    try {
                        const transaction = new StockTransaction({
                            productId: product._id,
                            productName: product.name,
                            type: 'adjustment',
                            quantity: quantity,
                            previousStock: previousStock,
                            newStock: product.quantityOnHand,
                            batchNumber: product.batchNumber || '',
                            remarks: `POSITIVE Adjustment: +${quantity} - ${remarks || ''}`,
                            receivedBy: approvedBy || 'system',
                            expiryDate: product.expiryDate
                        });
                        await transaction.save();
                    } catch (txError) {
                        console.error('Transaction error:', txError);
                    }
                    continue;
                }

                // NEGATIVE / LOSS ADJUSTMENT
                if (adjustmentType === 'negative' || adjustmentType === 'loss') {
                    const allBatches = await Product.find({ 
                        name: product.name 
                    }).sort({ expiryDate: 1 });
                    
                    let batchesToUse = allBatches;
                    if (adjustmentType === 'negative') {
                        batchesToUse = allBatches.filter(p => {
                            if (!p.expiryDate) return true;
                            return new Date(p.expiryDate) >= today;
                        });
                    }
                    
                    if (batchesToUse.length === 0) {
                        errors.push(`Item ${i + 1}: ${product.name} - No batches available.`);
                        continue;
                    }
                    
                    const totalAvailable = batchesToUse.reduce((sum, b) => sum + b.quantityOnHand, 0);
                    
                    if (quantity > totalAvailable) {
                        errors.push(`Item ${i + 1}: ${product.name} - Insufficient stock in batches! Available: ${totalAvailable}, Requested: ${quantity}`);
                        continue;
                    }
                    
                    let remainingToRemove = quantity;
                    const removedFromBatches = [];
                    
                    for (const batch of batchesToUse) {
                        if (remainingToRemove <= 0) break;
                        if (batch.quantityOnHand > 0) {
                            const takeFromBatch = Math.min(batch.quantityOnHand, remainingToRemove);
                            const previousStock = batch.quantityOnHand || 0;
                            batch.quantityOnHand = previousStock - takeFromBatch;
                            await batch.save();
                            remainingToRemove -= takeFromBatch;
                            
                            const adjType = adjustmentType === 'negative' ? 'adjustment-negative' : 'loss';
                            await recordToStockCard(
                                batch,
                                adjType,
                                takeFromBatch,
                                previousStock,
                                batch.quantityOnHand,
                                `${adjustmentType.toUpperCase()} Adjustment: -${takeFromBatch} - ${remarks || ''}`,
                                userName,
                                batch.batchNumber || '',
                                batch.expiryDate,
                                '',
                                referenceNumber,
                                '',
                                ''
                            );
                            
                            removedFromBatches.push({
                                productId: batch._id,
                                productName: batch.name,
                                batchNumber: batch.batchNumber || '',
                                quantity: takeFromBatch,
                                previousStock: previousStock,
                                newStock: batch.quantityOnHand,
                                expiryDate: batch.expiryDate
                            });
                            
                            try {
                                const transaction = new StockTransaction({
                                    productId: batch._id,
                                    productName: batch.name,
                                    type: 'adjustment',
                                    quantity: takeFromBatch,
                                    previousStock: previousStock,
                                    newStock: batch.quantityOnHand,
                                    batchNumber: batch.batchNumber || '',
                                    remarks: `${adjustmentType.toUpperCase()} Adjustment: -${takeFromBatch} - ${remarks || ''}`,
                                    receivedBy: approvedBy || 'system',
                                    expiryDate: batch.expiryDate
                                });
                                await transaction.save();
                            } catch (txError) {
                                console.error('Transaction error:', txError);
                            }
                        }
                    }
                    
                    if (remainingToRemove > 0) {
                        errors.push(`Item ${i + 1}: ${product.name} - Could not remove all ${quantity} units. Only ${quantity - remainingToRemove} removed.`);
                        continue;
                    }
                    
                    for (const removed of removedFromBatches) {
                        adjustedItems.push({
                            productId: removed.productId,
                            productName: removed.productName,
                            quantity: removed.quantity,
                            previousStock: removed.previousStock,
                            newStock: removed.newStock,
                            adjustmentType: adjustmentType,
                            batchNumber: removed.batchNumber,
                            expiryDate: removed.expiryDate
                        });
                    }
                }

            } catch (error) {
                errors.push(`Item ${i + 1}: ${error.message}`);
            }
        }

        const response = {
            success: errors.length === 0,
            data: {
                referenceNumber,
                adjustmentType,
                adjusted: adjustedItems,
                errors: errors.length > 0 ? errors : undefined,
                totalAdjusted: adjustedItems.length,
                totalErrors: errors.length,
                approvedBy,
                issuedBy: userName,
                fefoUsed: true,
                facilityName: facilityName || '',
                facilityContact: facilityContact || ''
            },
            message: errors.length === 0 
                ? `Successfully adjusted ${adjustedItems.length} item(s) (${adjustmentType})`
                : adjustedItems.length > 0 
                    ? `Partially successful: ${adjustedItems.length} item(s) adjusted, ${errors.length} error(s) (FEFO applied)`
                    : `Failed to adjust items. ${errors.length} error(s)`
        };

        if (adjustmentType === 'negative' && adjustedItems.length > 0) {
            try {
                const pdfData = {
                    referenceNumber: referenceNumber,
                    adjustmentType: adjustmentType,
                    approvedBy: approvedBy,
                    issuedBy: userName,
                    adjustmentDate: new Date().toISOString(),
                    remarks: remarks || '',
                    items: adjustedItems,
                    facilityName: facilityName || 'N/A',
                    facilityContact: facilityContact || 'N/A'
                };
                
                const pdfPath = await PDFService.generatePickingList(pdfData);
                response.data.pdfPath = pdfPath;
                response.data.pdfFileName = path.basename(pdfPath);
                console.log(`📄 PDF generated: ${pdfPath}`);
                console.log(`   Issued By: ${userName}`);
            } catch (pdfError) {
                console.error('❌ PDF generation error:', pdfError);
                response.data.pdfError = pdfError.message;
            }
        }

        res.json(response);

    } catch (error) {
        console.error('❌ Error adjusting stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error adjusting stock: ' + error.message
        });
    }
});

// ============================================================
// GET /api/stock/download-pdf/:filename
// ============================================================

router.get('/download-pdf/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const safeFilename = path.basename(filename);
        const filePath = path.join(__dirname, '../uploads/picking-lists', safeFilename);
        
        console.log(`📄 Downloading PDF: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ PDF not found: ${filePath}`);
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }
        
        const stats = fs.statSync(filePath);
        console.log(`📄 File size: ${stats.size} bytes`);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Length', stats.size);
        
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        
        readStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).json({ success: false, message: 'Error streaming PDF' });
        });
        
    } catch (error) {
        console.error('PDF download error:', error);
        res.status(500).json({ success: false, message: 'Error downloading PDF: ' + error.message });
    }
});

// ============================================================
// TRANSACTIONS
// ============================================================

router.get('/transactions', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const transactions = await StockTransaction.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching transactions' });
    }
});

module.exports = router;