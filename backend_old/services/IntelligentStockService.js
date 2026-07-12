const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');
const mongoose = require('mongoose');

class IntelligentStockService {
    // ... (keep all existing methods unchanged)

    async getExpiryAlerts(facilityId, days = 90) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        const expiringStock = await StockTransaction.aggregate([
            {
                $match: {
                    facility: new mongoose.Types.ObjectId(facilityId),
                    expiryDate: {
                        $gte: new Date(),
                        $lte: expiryDate
                    },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$batchNumber',
                    product: { $first: '$product' },
                    expiryDate: { $first: '$expiryDate' },
                    totalReceived: { $sum: '$quantityReceived' },
                    totalIssued: { $sum: '$quantityIssued' },
                    totalLosses: { $sum: '$losses' }
                }
            },
            {
                $addFields: {
                    totalStock: {
                        $subtract: [
                            { $subtract: ['$totalReceived', '$totalIssued'] },
                            '$totalLosses'
                        ]
                    }
                }
            },
            {
                $match: {
                    totalStock: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $project: {
                    _id: 0,
                    batchNumber: '$_id',
                    product: '$productDetails',
                    expiryDate: 1,
                    totalStock: 1
                }
            }
        ]);

        return expiringStock;
    }
}

module.exports = IntelligentStockService;
