const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getStockCard,
    addTransaction,
    spotCheck,
    physicalInventory,
    getSpotCheckHistory,
    getPhysicalInventoryHistory,
    getMonthEndReport
} = require('../controllers/stockCardController');

// All routes require authentication
router.use(auth);

// GET stock card for a product
router.get('/:productId', getStockCard);

// POST add transaction
router.post('/', addTransaction);

// POST spot check (Yellow)
router.post('/spot-check', spotCheck);

// POST physical inventory (Red - Month End)
router.post('/physical-inventory', physicalInventory);

// GET spot check history
router.get('/spot-check/:productId', getSpotCheckHistory);

// GET physical inventory history
router.get('/physical-inventory/:productId', getPhysicalInventoryHistory);

// GET month end report
router.get('/month-end/report', getMonthEndReport);

module.exports = router;
