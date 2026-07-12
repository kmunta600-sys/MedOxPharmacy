const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getAllQuarantined,
    quarantineProduct,
    releaseFromQuarantine,
    disposeQuarantined,
    getQuarantineById,
    getQuarantineStats
} = require('../controllers/quarantineController');

// All routes require authentication
router.use(auth);

// GET all quarantined products
router.get('/', getAllQuarantined);

// GET quarantine statistics
router.get('/stats', getQuarantineStats);

// GET quarantine by ID
router.get('/:id', getQuarantineById);

// POST quarantine a product
router.post('/', quarantineProduct);

// PUT release from quarantine
router.put('/:id/release', releaseFromQuarantine);

// PUT dispose quarantined product
router.put('/:id/dispose', disposeQuarantined);

module.exports = router;
