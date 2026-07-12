// Inventory Validation Utilities

export const validateQuantity = (quantity, maxStock = 99999) => {
    if (!quantity && quantity !== 0) {
        return { valid: false, message: 'Please enter a quantity' };
    }
    
    const qty = parseInt(quantity);
    if (isNaN(qty)) {
        return { valid: false, message: 'Please enter a valid number' };
    }
    
    if (qty < 0) {
        return { valid: false, message: 'Quantity cannot be negative' };
    }
    
    if (qty === 0) {
        return { valid: false, message: 'Quantity must be greater than 0' };
    }
    
    if (qty > maxStock) {
        return { valid: false, message: `Quantity cannot exceed ${maxStock}` };
    }
    
    return { valid: true, quantity: qty };
};

export const validateStockAvailability = (requested, available) => {
    if (requested > available) {
        return { 
            valid: false, 
            message: `Insufficient stock! Only ${available} units available.` 
        };
    }
    return { valid: true };
};

export const validatePhysicalCount = (count, systemQty) => {
    const qty = parseInt(count);
    if (isNaN(qty) || qty < 0) {
        return { valid: false, message: 'Please enter a valid physical count' };
    }
    
    // Warn if difference is too large (more than 50% of system qty)
    const diff = Math.abs(qty - systemQty);
    if (systemQty > 0 && diff > systemQty * 0.5) {
        return { 
            valid: true, 
            warning: true, 
            message: `⚠️ Physical count (${qty}) differs significantly from system (${systemQty}). Please double-check.` 
        };
    }
    
    return { valid: true };
};
