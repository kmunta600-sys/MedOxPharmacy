// Intelligent Physical Inventory Storage System
// Stores historical data, calculates trends, and provides insights

export const savePhysicalInventoryData = (products, officerName, notes) => {
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthName = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    
    // Get existing historical data
    const historicalData = getHistoricalData();
    
    // Create current month data
    const currentMonthData = {
        month: month,
        monthName: monthName,
        year: year,
        date: today.toISOString(),
        officerName: officerName,
        notes: notes,
        products: products.map(p => ({
            productId: p._id,
            productName: p.name,
            productCode: p.code,
            systemQuantity: p.systemQuantity,
            physicalQuantity: p.physicalQuantity,
            difference: p.physicalQuantity - p.systemQuantity,
            monthTotal: p.monthTotal || 0
        })),
        // Calculate overall stats
        totalProducts: products.length,
        totalDifference: products.reduce((sum, p) => sum + (p.physicalQuantity - p.systemQuantity), 0),
        productsWithChanges: products.filter(p => p.physicalQuantity !== p.systemQuantity).length
    };
    
    // Add to historical data
    historicalData[month] = currentMonthData;
    
    // Save to localStorage
    localStorage.setItem('physical_inventory_historical', JSON.stringify(historicalData));
    
    // Also save current month as latest
    localStorage.setItem('physical_inventory_latest', JSON.stringify(currentMonthData));
    
    return currentMonthData;
};

export const getHistoricalData = () => {
    try {
        const data = localStorage.getItem('physical_inventory_historical');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading historical data:', e);
    }
    return {};
};

export const getLatestPhysicalInventory = () => {
    try {
        const data = localStorage.getItem('physical_inventory_latest');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading latest data:', e);
    }
    return null;
};

export const getProductTrend = (productId) => {
    const historical = getHistoricalData();
    const trends = [];
    const months = Object.keys(historical).sort();
    
    // Get last 6 months of data for this product
    const last6Months = months.slice(-6);
    
    for (const month of last6Months) {
        const monthData = historical[month];
        const product = monthData.products.find(p => p.productId === productId);
        if (product) {
            trends.push({
                month: monthData.monthName + ' ' + monthData.year,
                physicalQuantity: product.physicalQuantity,
                systemQuantity: product.systemQuantity,
                difference: product.difference,
                monthTotal: product.monthTotal || 0
            });
        }
    }
    
    // Calculate trend
    if (trends.length >= 2) {
        const first = trends[0].physicalQuantity;
        const last = trends[trends.length - 1].physicalQuantity;
        const change = last - first;
        const percentChange = first !== 0 ? (change / first) * 100 : 0;
        
        return {
            trends: trends,
            change: change,
            percentChange: percentChange,
            direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
            message: change > 0 ? `📈 Stock increased by ${Math.abs(percentChange).toFixed(1)}%` 
                    : change < 0 ? `📉 Stock decreased by ${Math.abs(percentChange).toFixed(1)}%` 
                    : '📊 Stock is stable'
        };
    }
    
    return {
        trends: trends,
        change: 0,
        percentChange: 0,
        direction: 'insufficient_data',
        message: '⚠️ Insufficient data for trend analysis'
    };
};

export const getReorderRecommendation = (productId, productName) => {
    const trend = getProductTrend(productId);
    const latest = getLatestPhysicalInventory();
    
    if (!latest) {
        return {
            recommended: false,
            message: 'No physical inventory data available',
            quantity: 0
        };
    }
    
    const product = latest.products.find(p => p.productId === productId);
    if (!product) {
        return {
            recommended: false,
            message: 'Product not found in latest inventory',
            quantity: 0
        };
    }
    
    // Calculate average monthly consumption
    let totalConsumption = 0;
    let monthsWithData = 0;
    const historical = getHistoricalData();
    const months = Object.keys(historical).sort().slice(-6);
    
    for (const month of months) {
        const monthData = historical[month];
        const p = monthData.products.find(p => p.productId === productId);
        if (p && p.monthTotal > 0) {
            totalConsumption += p.monthTotal;
            monthsWithData++;
        }
    }
    
    const avgConsumption = monthsWithData > 0 ? totalConsumption / monthsWithData : 0;
    const currentStock = product.physicalQuantity;
    
    // Determine if reorder is needed
    const reorderThreshold = avgConsumption * 1.5; // 1.5 months of stock
    const recommended = currentStock < reorderThreshold;
    
    return {
        recommended: recommended,
        currentStock: currentStock,
        avgMonthlyConsumption: Math.round(avgConsumption),
        reorderThreshold: Math.round(reorderThreshold),
        quantity: recommended ? Math.round(reorderThreshold - currentStock) : 0,
        message: recommended 
            ? `⚠️ Reorder recommended! Current stock (${currentStock}) is below threshold (${Math.round(reorderThreshold)})`
            : `✅ Stock is healthy. Current stock (${currentStock}) is above threshold (${Math.round(reorderThreshold)})`,
        urgency: currentStock < reorderThreshold * 0.5 ? 'high' 
                : currentStock < reorderThreshold ? 'medium' 
                : 'low'
    };
};

export const getStockHealthScore = (productId) => {
    const trend = getProductTrend(productId);
    const recommendation = getReorderRecommendation(productId, '');
    
    let score = 100;
    
    // Reduce score based on trend
    if (trend.direction === 'decreasing') {
        score -= 20;
    }
    
    // Reduce score if reorder is recommended
    if (recommendation.recommended) {
        score -= 30;
        if (recommendation.urgency === 'high') {
            score -= 20;
        }
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
        score: score,
        level: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical',
        color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#EF4444' : '#7F1D1D'
    };
};

// Get all products with their health status
export const getAllProductHealth = (products) => {
    return products.map(product => {
        const trend = getProductTrend(product._id);
        const recommendation = getReorderRecommendation(product._id, product.name);
        const health = getStockHealthScore(product._id);
        
        return {
            ...product,
            trend: trend,
            recommendation: recommendation,
            health: health
        };
    });
};
