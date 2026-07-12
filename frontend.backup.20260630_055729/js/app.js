// ============================================================
// API URL
// ============================================================
const API_URL = window.location.origin;

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(pageId) {
    console.log('Navigating to:', pageId);
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var pageMap = {
        'landing': 'landing',
        'login': 'loginPage',
        'dashboard': 'dashboardPage',
        'receiveStock': 'receiveStockPage',
        'issueStock': 'issueStockPage',
        'search': 'searchPage',
        'addProduct': 'addProductPage',
        'stockCard': 'stockCardPage'
    };
    var targetId = pageMap[pageId];
    if (targetId) {
        var target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
            console.log('Showing:', targetId);
            if (pageId === 'dashboard') setTimeout(loadDashboardData, 300);
            if (pageId === 'search') setTimeout(loadProductsForSearch, 300);
            if (pageId === 'receiveStock') setTimeout(loadReceiveProducts, 300);
            if (pageId === 'issueStock') setTimeout(function() { loadWards(); loadIssueProducts(); clearIssueForm(); }, 300);
        }
    }
}
window.navigateTo = navigateTo;

// ============================================================
// LOGIN / LOGOUT
// ============================================================
function handleLogin() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    var errorBox = document.getElementById('loginError');
    if (!email || !password) {
        errorBox.className = 'login-error show';
        document.getElementById('loginErrorText').textContent = 'Please enter both email and password.';
        return;
    }
    errorBox.className = 'login-error';
    fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            navigateTo('dashboard');
        } else {
            errorBox.className = 'login-error show';
            document.getElementById('loginErrorText').textContent = data.message || 'Invalid credentials.';
        }
    })
    .catch(function(error) {
        errorBox.className = 'login-error show';
        document.getElementById('loginErrorText').textContent = 'Network error. Please try again.';
    });
}
window.handleLogin = handleLogin;

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigateTo('landing');
    }
}

// ============================================================
// DASHBOARD
// ============================================================
function loadDashboardData() {
    var token = localStorage.getItem('token');
    if (!token) { navigateTo('login'); return; }
    try {
        var user = JSON.parse(localStorage.getItem('user'));
        var userEmailEl = document.getElementById('dashboardUser');
        if (userEmailEl) userEmailEl.textContent = user.email || 'User';
        var hour = new Date().getHours();
        var greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
        var welcomeEl = document.getElementById('welcomeMessage');
        if (welcomeEl) welcomeEl.textContent = greeting + ', ' + (user.firstName || 'User');
    } catch(e) {}
    fetch(API_URL + '/api/products/stats', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(function(response) {
        if (response.status === 401) { logout(); return; }
        return response.json();
    })
    .then(function(data) {
        if (data && data.success) {
            var totalEl = document.getElementById('totalProducts');
            var lowEl = document.getElementById('lowStock');
            var critEl = document.getElementById('criticalAlerts');
            if (totalEl) totalEl.textContent = data.data.totalProducts || 0;
            if (lowEl) lowEl.textContent = data.data.lowStock || 0;
            if (critEl) critEl.textContent = data.data.criticalStock || 0;
            renderTransactions(data.data.recentTransactions || []);
            renderAlerts(data.data.alerts || { critical: [], low: [] });
        }
    })
    .catch(function(error) { console.error('Dashboard error:', error); });
}

function renderTransactions(transactions) {
    var container = document.getElementById('recentTransactions');
    if (!container) return;
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="empty"><i class="fas fa-inbox"></i>No recent activity</div>';
        return;
    }
    var html = '';
    transactions.forEach(function(tx) {
        var isReceived = tx.type === 'received';
        var color = isReceived ? '#10B981' : '#EF4444';
        var sign = isReceived ? '+' : '-';
        var icon = isReceived ? 'fa-arrow-down' : 'fa-arrow-up';
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.03);">';
        html += '<div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;background:' + (isReceived ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') + ';color:' + color + ';"><i class="fas ' + icon + '"></i></div>';
        html += '<div style="flex:1;"><div style="font-size:12px;font-weight:500;">' + (tx.product || 'Unknown') + '</div><div style="font-size:10px;color:var(--text-muted);">' + (tx.date || '') + '</div></div>';
        html += '<div style="font-weight:600;font-size:13px;color:' + color + ';">' + sign + (tx.qty || 0) + '</div>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderAlerts(alerts) {
    var container = document.getElementById('alertsContainer');
    if (!container) return;
    var critical = alerts.critical || [];
    var low = alerts.low || [];
    if (critical.length === 0 && low.length === 0) {
        container.innerHTML = '<div class="empty"><i class="fas fa-check-circle" style="color:#10B981;"></i>All products are well stocked!</div>';
        return;
    }
    var html = '';
    critical.forEach(function(p) {
        html += '<div class="alert-item"><span class="dot critical"></span><div class="text"><span class="name">' + (p.name || '') + ' ' + (p.strength || '') + '</span> <span class="stock">• ' + (p.quantityOnHand || 0) + ' left</span></div><span class="badge critical">CRITICAL</span></div>';
    });
    low.forEach(function(p) {
        html += '<div class="alert-item"><span class="dot low"></span><div class="text"><span class="name">' + (p.name || '') + ' ' + (p.strength || '') + '</span> <span class="stock">• ' + (p.quantityOnHand || 0) + ' left</span></div><span class="badge low">LOW</span></div>';
    });
    container.innerHTML = html;
}

// ============================================================
// WARD MANAGEMENT
// ============================================================
var wards = [];

function loadWards() {
    try {
        var saved = localStorage.getItem('pharmacyWards');
        if (saved) {
            wards = JSON.parse(saved);
        } else {
            wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Customer', 'Pharmacy', 'Other'];
            saveWards();
        }
        renderWards();
        updateWardDropdown();
    } catch(e) {
        wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Customer', 'Pharmacy', 'Other'];
        saveWards();
        renderWards();
        updateWardDropdown();
    }
}

function saveWards() {
    try { localStorage.setItem('pharmacyWards', JSON.stringify(wards)); } catch(e) {}
}

function renderWards() {
    var container = document.getElementById('wardTags');
    if (!container) return;
    if (wards.length === 0) {
        container.innerHTML = '<span style="font-size:12px;color:var(--text-muted);opacity:0.5;">No wards added.</span>';
        return;
    }
    var html = '';
    wards.forEach(function(ward, index) {
        html += '<span class="ward-tag"><i class="fas fa-hospital"></i><span>' + ward + '</span><button class="remove-ward" onclick="removeWard(' + index + ')"><i class="fas fa-times"></i></button></span>';
    });
    container.innerHTML = html;
}

function updateWardDropdown() {
    var select = document.getElementById('issueTo');
    if (!select) return;
    var currentValue = select.value;
    select.innerHTML = '<option value="">Select...</option>';
    wards.forEach(function(ward) {
        var option = document.createElement('option');
        option.value = ward;
        option.textContent = ward;
        select.appendChild(option);
    });
    var separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    select.appendChild(separator);
    var manualOption = document.createElement('option');
    manualOption.value = '__manual__';
    manualOption.textContent = '✏️ Enter manually...';
    manualOption.style.color = 'var(--gold)';
    select.appendChild(manualOption);
    if (currentValue) select.value = currentValue;
}

function showAddWardModal() {
    var wardName = prompt('Enter new ward name:', '');
    if (wardName && wardName.trim()) {
        wardName = wardName.trim();
        if (wards.indexOf(wardName) === -1) {
            wards.push(wardName);
            saveWards();
            renderWards();
            updateWardDropdown();
            document.getElementById('issueTo').value = wardName;
        } else {
            alert('⚠️ Ward "' + wardName + '" already exists!');
        }
    }
}

function removeWard(index) {
    if (wards.length <= 1) { alert('⚠️ You need at least one ward option.'); return; }
    var wardName = wards[index];
    if (confirm('Remove ward "' + wardName + '"?')) {
        wards.splice(index, 1);
        saveWards();
        renderWards();
        updateWardDropdown();
        var select = document.getElementById('issueTo');
        if (select && select.value === wardName) select.value = '';
    }
}

// ============================================================
// RECEIVE STOCK
// ============================================================
var productsCache = [];

function loadReceiveProducts() {
    var token = localStorage.getItem('token');
    if (!token) return;
    fetch(API_URL + '/api/products', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data && data.success) {
            productsCache = data.data;
            populateReceiveDropdown(productsCache);
        }
    })
    .catch(function(error) { console.error('Error loading products:', error); });
}

function populateReceiveDropdown(products) {
    var select = document.getElementById('receiveProduct');
    if (!select) return;
    select.innerHTML = '<option value="">Select a product...</option>';
    if (!products || products.length === 0) { select.innerHTML = '<option value="">No products available</option>'; return; }
    products.forEach(function(p) {
        var option = document.createElement('option');
        option.value = p._id;
        option.textContent = p.name + ' ' + (p.strength || '') + ' | Stock: ' + (p.quantityOnHand || 0) + ' | Code: ' + (p.code || 'N/A');
        select.appendChild(option);
    });
}

function searchProductsForReceive(query) {
    var select = document.getElementById('receiveProduct');
    if (!select) return;
    var searchTerm = query.toLowerCase().trim();
    if (!searchTerm) { populateReceiveDropdown(productsCache); return; }
    var filtered = productsCache.filter(function(p) {
        var name = (p.name || '').toLowerCase();
        var strength = (p.strength || '').toLowerCase();
        var code = (p.code || '').toLowerCase();
        return name.includes(searchTerm) || strength.includes(searchTerm) || code.includes(searchTerm);
    });
    populateReceiveDropdown(filtered);
    if (filtered.length === 1) {
        select.value = filtered[0]._id;
        updateReceiveProductInfo(filtered[0]);
    }
}

function updateReceiveProductInfo(product) {
    var stockEl = document.getElementById('receiveCurrentStock');
    var codeEl = document.getElementById('receiveProductCode');
    if (stockEl) stockEl.textContent = product.quantityOnHand || 0;
    if (codeEl) codeEl.textContent = product.code || '—';
}

function submitReceiveStock() {
    var productId = document.getElementById('receiveProduct').value;
    var qty = parseInt(document.getElementById('receiveQty').value);
    var batch = document.getElementById('receiveBatch').value.trim();
    var expiry = document.getElementById('receiveExpiry').value;
    var dNote = document.getElementById('receiveDNote').value.trim();
    var supplier = document.getElementById('receiveSupplier').value.trim();
    var remarks = document.getElementById('receiveRemarks').value.trim();

    if (!productId) { alert('Please select a product.'); return; }
    if (!qty || qty <= 0) { alert('Please enter a valid quantity.'); return; }
    if (!batch) { alert('Please enter a batch number.'); return; }
    if (!expiry) { alert('Please select an expiry date.'); return; }

    var token = localStorage.getItem('token');
    if (!token) { alert('Please login first.'); return; }

    var product = productsCache.find(function(p) { return p._id === productId; });
    if (!product) { alert('Product not found.'); return; }

    var newStock = (product.quantityOnHand || 0) + qty;
    var btn = document.querySelector('#receiveStockPage .btn-gold');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'; btn.disabled = true; }

    fetch(API_URL + '/api/products/' + productId, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityReceived: qty, quantityOnHand: newStock, batchNumber: batch, expiryDate: expiry, dNote: dNote, supplier: supplier, remarks: remarks })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            alert('✅ Stock received successfully!\n\nProduct: ' + data.data.name + ' ' + (data.data.strength || '') + '\nNew Stock: ' + data.data.quantityOnHand + ' units\nBatch: ' + data.data.batchNumber);
            clearReceiveForm();
            loadReceiveProducts();
            if (document.getElementById('dashboardPage') && document.getElementById('dashboardPage').classList.contains('active')) loadDashboardData();
        } else {
            alert('❌ Error: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error) { alert('❌ Network error: ' + error.message); })
    .finally(function() {
        var btn = document.querySelector('#receiveStockPage .btn-gold');
        if (btn) { btn.innerHTML = '<i class="fas fa-arrow-down"></i> Receive Stock'; btn.disabled = false; }
    });
}

function clearReceiveForm() {
    var qty = document.getElementById('receiveQty');
    var batch = document.getElementById('receiveBatch');
    var expiry = document.getElementById('receiveExpiry');
    var dNote = document.getElementById('receiveDNote');
    var supplier = document.getElementById('receiveSupplier');
    var remarks = document.getElementById('receiveRemarks');
    var product = document.getElementById('receiveProduct');
    var stock = document.getElementById('receiveCurrentStock');
    var code = document.getElementById('receiveProductCode');
    var search = document.getElementById('receiveSearch');
    if (qty) qty.value = '';
    if (batch) batch.value = '';
    if (expiry) expiry.value = '';
    if (dNote) dNote.value = '';
    if (supplier) supplier.value = '';
    if (remarks) remarks.value = '';
    if (product) product.value = '';
    if (stock) stock.textContent = '0';
    if (code) code.textContent = '—';
    if (search) search.value = '';
    loadReceiveProducts();
}

// ============================================================
// ISSUE STOCK
// ============================================================
var issueProductsCache = [];

function loadIssueProducts() {
    var token = localStorage.getItem('token');
    if (!token) return;
    fetch(API_URL + '/api/products', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data && data.success) {
            issueProductsCache = data.data;
            document.querySelectorAll('.issue-product-select').forEach(function(select) {
                populateIssueDropdown(select);
            });
        }
    })
    .catch(function(error) { console.error('Error loading products:', error); });
}

function populateIssueDropdown(select) {
    if (!select) return;
    select.innerHTML = '<option value="">Select product...</option>';
    issueProductsCache.forEach(function(p) {
        var option = document.createElement('option');
        option.value = p._id;
        option.textContent = p.name + ' ' + (p.strength || '') + ' | Stock: ' + (p.quantityOnHand || 0);
        option.dataset.stock = p.quantityOnHand || 0;
        select.appendChild(option);
    });
}

function searchIssueProduct(input) {
    var row = input.closest('.issue-row');
    var select = row.querySelector('.issue-product-select');
    var searchTerm = input.value.toLowerCase().trim();
    if (!searchTerm) {
        select.style.display = 'none';
        populateIssueDropdown(select);
        return;
    }
    var filtered = issueProductsCache.filter(function(p) {
        var name = (p.name || '').toLowerCase();
        var strength = (p.strength || '').toLowerCase();
        var code = (p.code || '').toLowerCase();
        return name.includes(searchTerm) || strength.includes(searchTerm) || code.includes(searchTerm);
    });
    select.style.display = 'block';
    select.innerHTML = '<option value="">Select product...</option>';
    filtered.forEach(function(p) {
        var option = document.createElement('option');
        option.value = p._id;
        option.textContent = p.name + ' ' + (p.strength || '') + ' | Stock: ' + (p.quantityOnHand || 0);
        option.dataset.stock = p.quantityOnHand || 0;
        select.appendChild(option);
    });
    var newSelect = select.cloneNode(true);
    select.parentNode.replaceChild(newSelect, select);
    newSelect.addEventListener('change', function() {
        var selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            var row = this.closest('.issue-row');
            var searchInput = row.querySelector('.issue-search');
            var stockSpan = row.querySelector('.issue-available-stock');
            var qtyInput = row.querySelector('.issue-qty');
            var productId = row.querySelector('.issue-product-id');
            searchInput.value = selectedOption.textContent;
            var stock = parseInt(selectedOption.dataset.stock) || 0;
            stockSpan.textContent = stock;
            productId.value = selectedOption.value;
            this.style.display = 'none';
            qtyInput.disabled = false;
            qtyInput.value = '';
            qtyInput.focus();
        }
    });
}

function addIssueRow() {
    var container = document.getElementById('issueItemsContainer');
    if (!container) return;
    var newRow = document.createElement('div');
    newRow.className = 'issue-row';
    newRow.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 40px;gap:8px;padding:4px 10px;align-items:center;border-bottom:1px solid rgba(255,255,255,0.03);';
    newRow.innerHTML = `
        <div style="position:relative;">
            <input type="text" class="issue-search" placeholder="Search product..." style="width:100%;padding:8px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:var(--white);font-family:var(--font);outline:none;" oninput="searchIssueProduct(this)" />
            <select class="issue-product-select" style="width:100%;padding:8px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:var(--white);font-family:var(--font);outline:none;margin-top:4px;display:none;">
                <option value="">Select product...</option>
            </select>
            <input type="hidden" class="issue-product-id" />
        </div>
        <div>
            <input type="number" class="issue-qty" placeholder="0" min="1" style="width:100%;padding:8px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:var(--white);font-family:var(--font);outline:none;" onchange="checkRowStock(this)" />
        </div>
        <div>
            <span class="issue-available-stock" style="font-size:13px;color:var(--text-muted);">0</span>
        </div>
        <div style="text-align:center;">
            <button onclick="removeIssueRow(this)" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:4px 8px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(newRow);
    var newSelect = newRow.querySelector('.issue-product-select');
    populateIssueDropdown(newSelect);
    newSelect.addEventListener('change', function() {
        var selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            var row = this.closest('.issue-row');
            var searchInput = row.querySelector('.issue-search');
            var stockSpan = row.querySelector('.issue-available-stock');
            var qtyInput = row.querySelector('.issue-qty');
            var productId = row.querySelector('.issue-product-id');
            searchInput.value = selectedOption.textContent;
            var stock = parseInt(selectedOption.dataset.stock) || 0;
            stockSpan.textContent = stock;
            productId.value = selectedOption.value;
            this.style.display = 'none';
            qtyInput.disabled = false;
            qtyInput.value = '';
            qtyInput.focus();
        }
    });
    setTimeout(function() { newRow.querySelector('.issue-search').focus(); }, 100);
}

function removeIssueRow(btn) {
    var rows = document.querySelectorAll('.issue-row');
    if (rows.length <= 1) { alert('You need at least one item row.'); return; }
    btn.closest('.issue-row').remove();
}

function checkRowStock(input) {
    var row = input.closest('.issue-row');
    var stockSpan = row.querySelector('.issue-available-stock');
    var available = parseInt(stockSpan.textContent) || 0;
    var qty = parseInt(input.value) || 0;
    if (qty > available) {
        input.style.borderColor = '#EF4444';
        alert('⚠️ Quantity exceeds available stock (' + available + ' units)');
    } else {
        input.style.borderColor = 'rgba(255,255,255,0.06)';
    }
}

function submitIssueMultiple() {
    var rows = document.querySelectorAll('.issue-row');
    var items = [];
    var token = localStorage.getItem('token');
    if (!token) { alert('Please login first.'); return; }
    var issueTo = document.getElementById('issueTo').value;
    if (!issueTo) { alert('Please select a destination.'); return; }
    var patient = document.getElementById('issuePatient').value.trim();
    var reference = document.getElementById('issueReference').value.trim();
    var officer = document.getElementById('issueOfficer').value.trim() || 'Pharmacist';
    var hasError = false;
    var errorMessages = [];
    rows.forEach(function(row, index) {
        var productId = row.querySelector('.issue-product-id').value;
        var qtyInput = row.querySelector('.issue-qty');
        var qty = parseInt(qtyInput.value) || 0;
        var searchInput = row.querySelector('.issue-search');
        var productName = searchInput ? searchInput.value : 'Row ' + (index + 1);
        var stockSpan = row.querySelector('.issue-available-stock');
        var availableStock = parseInt(stockSpan.textContent) || 0;
        if (!productId && !qty && !searchInput.value) { return; }
        if (!productId) {
            hasError = true;
            errorMessages.push('Row ' + (index + 1) + ': No product selected');
            searchInput.style.borderColor = '#EF4444';
            return;
        }
        if (!qty || qty <= 0) {
            hasError = true;
            errorMessages.push(productName + ': Please enter a valid quantity');
            qtyInput.style.borderColor = '#EF4444';
            return;
        }
        if (qty > availableStock) {
            hasError = true;
            errorMessages.push(productName + ': Quantity exceeds stock (' + availableStock + ' units)');
            qtyInput.style.borderColor = '#EF4444';
            return;
        }
        items.push({ productId: productId, qty: qty, productName: productName, row: row, newStock: availableStock - qty });
    });
    if (hasError) { alert('⚠️ Please fix:\n\n' + errorMessages.join('\n')); return; }
    if (items.length === 0) { alert('Please add at least one item.'); return; }
    var confirmMsg = '📋 Confirm Issue\n\n';
    confirmMsg += 'Destination: ' + issueTo + '\n';
    if (patient) confirmMsg += 'Patient: ' + patient + '\n';
    if (reference) confirmMsg += 'Reference: ' + reference + '\n\n';
    confirmMsg += 'Items:\n';
    items.forEach(function(item) { confirmMsg += '  • ' + item.productName + ' → ' + item.qty + ' units\n'; });
    confirmMsg += '\nProceed?';
    if (!confirm(confirmMsg)) return;
    var btn = document.querySelector('#issueStockPage .btn-gold');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'; btn.disabled = true; }
    var completed = 0;
    var errors = [];
    var successItems = [];
    items.forEach(function(item) {
        var product = issueProductsCache.find(function(p) { return p._id === item.productId; });
        if (!product) { errors.push(item.productName + ': Product not found'); completed++; return; }
        var newStock = (product.quantityOnHand || 0) - item.qty;
        fetch(API_URL + '/api/products/' + item.productId, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantityOnHand: newStock, remarks: 'Issued to ' + issueTo + (patient ? ' - ' + patient : '') + (reference ? ' - Ref: ' + reference : '') + ' by ' + officer })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            completed++;
            if (data.success) {
                successItems.push({ name: item.productName, qty: item.qty, newStock: newStock });
                var row = item.row;
                if (row) {
                    row.querySelector('.issue-available-stock').textContent = newStock;
                    row.querySelector('.issue-qty').disabled = true;
                    var searchInput = row.querySelector('.issue-search');
                    searchInput.value = '✅ ' + item.productName + ' (' + item.qty + ' units)';
                    searchInput.style.color = '#10B981';
                    searchInput.disabled = true;
                    var select = row.querySelector('.issue-product-select');
                    if (select) select.style.display = 'none';
                }
            } else { errors.push(item.productName + ': ' + (data.message || 'Unknown error')); }
            if (completed === items.length) {
                var btn = document.querySelector('#issueStockPage .btn-gold');
                if (btn) { btn.innerHTML = '<i class="fas fa-arrow-up"></i> Issue All Items'; btn.disabled = false; }
                if (errors.length === 0) {
                    var msg = '✅ ISSUE COMPLETED!\n\n';
                    msg += 'Destination: ' + issueTo + '\n';
                    if (patient) msg += 'Patient: ' + patient + '\n';
                    msg += '\n📦 Items Issued:\n';
                    var totalUnits = 0;
                    successItems.forEach(function(item) {
                        msg += '  • ' + item.name + ': ' + item.qty + ' units (Remaining: ' + item.newStock + ')\n';
                        totalUnits += item.qty;
                    });
                    msg += '\nTotal Items: ' + successItems.length + '\n';
                    msg += 'Total Units: ' + totalUnits;
                    alert(msg);
                    setTimeout(function() {
                        clearIssueForm();
                        if (document.getElementById('dashboardPage') && document.getElementById('dashboardPage').classList.contains('active')) { loadDashboardData(); }
                        loadIssueProducts();
                    }, 1000);
                } else { alert('⚠️ Errors:\n' + errors.join('\n')); }
            }
        })
        .catch(function(error) {
            completed++;
            errors.push(item.productName + ': Network error');
            if (completed === items.length) {
                var btn = document.querySelector('#issueStockPage .btn-gold');
                if (btn) { btn.innerHTML = '<i class="fas fa-arrow-up"></i> Issue All Items'; btn.disabled = false; }
                alert('⚠️ Errors:\n' + errors.join('\n'));
            }
        });
    });
}

function clearIssueForm() {
    var to = document.getElementById('issueTo');
    var patient = document.getElementById('issuePatient');
    var ref = document.getElementById('issueReference');
    var officer = document.getElementById('issueOfficer');
    if (to) to.value = '';
    if (patient) patient.value = '';
    if (ref) ref.value = '';
    try {
        var user = JSON.parse(localStorage.getItem('user'));
        if (officer) officer.value = (user.firstName || '') + ' ' + (user.lastName || '') || 'Pharmacist';
    } catch(e) {}
    var container = document.getElementById('issueItemsContainer');
    if (!container) return;
    container.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'issue-row';
    row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 40px;gap:8px;padding:4px 10px;align-items:center;border-bottom:1px solid rgba(255,255,255,0.03);';
    row.innerHTML = `
        <div style="position:relative;">
            <input type="text" class="issue-search" placeholder="Search product..." style="width:100%;padding:8px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:var(--white);font-family:var(--font);outline:none;" oninput="searchIssueProduct(this)" />
            <select class="issue-product-select" style="width:100%;padding:8px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:var(--white);font-family:var(--font);outline:none;margin-top:4px;display:none;">
                <option value="">Select product...</option>
            </select>
            <input type="hidden" class="issue-product-id" />
        </div>
        <div>
            <input type="number" class="issue-qty" placeholder="0" min="1" style="width:100%;padding:8px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:var(--white);font-family:var(--font);outline:none;" onchange="checkRowStock(this)" />
        </div>
        <div>
            <span class="issue-available-stock" style="font-size:13px;color:var(--text-muted);">0</span>
        </div>
        <div style="text-align:center;">
            <button onclick="removeIssueRow(this)" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:4px 8px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(row);
    var select = row.querySelector('.issue-product-select');
    populateIssueDropdown(select);
    select.addEventListener('change', function() {
        var selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            var row = this.closest('.issue-row');
            var searchInput = row.querySelector('.issue-search');
            var stockSpan = row.querySelector('.issue-available-stock');
            var qtyInput = row.querySelector('.issue-qty');
            var productId = row.querySelector('.issue-product-id');
            searchInput.value = selectedOption.textContent;
            var stock = parseInt(selectedOption.dataset.stock) || 0;
            stockSpan.textContent = stock;
            productId.value = selectedOption.value;
            this.style.display = 'none';
            qtyInput.disabled = false;
            qtyInput.value = '';
            qtyInput.focus();
        }
    });
    loadWards();
    loadIssueProducts();
}

// ============================================================
// SEARCH
// ============================================================
var allProducts = [];

function loadProductsForSearch() {
    var token = localStorage.getItem('token');
    if (!token) return;
    fetch(API_URL + '/api/products', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data && data.success) {
            allProducts = data.data;
            var countEl = document.getElementById('resultCountText');
            if (countEl) countEl.textContent = allProducts.length + ' products found';
            renderSearchResults(allProducts);
        }
    })
    .catch(function(error) { console.error('Error loading products:', error); });
}

function performSearch() {
    var query = document.getElementById('searchQuery').value.toLowerCase().trim();
    if (!query) { renderSearchResults(allProducts); document.getElementById('resultCountText').textContent = allProducts.length + ' products found'; return; }
    var filtered = allProducts.filter(function(p) {
        var name = (p.name || '').toLowerCase();
        var strength = (p.strength || '').toLowerCase();
        var code = (p.code || '').toLowerCase();
        var category = (p.category || '').toLowerCase();
        return name.includes(query) || strength.includes(query) || code.includes(query) || category.includes(query);
    });
    document.getElementById('resultCountText').textContent = filtered.length + ' products found for "' + query + '"';
    renderSearchResults(filtered);
}

function filterProducts(type) {
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.querySelector('.filter-btn[data-filter="' + type + '"]');
    if (btn) btn.classList.add('active');
    var results = [];
    var today = new Date();
    var thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    switch(type) {
        case 'all': results = allProducts; break;
        case 'low': results = allProducts.filter(function(p) { var s = p.quantityOnHand || 0; return s > 0 && s <= (p.minStock || 50); }); break;
        case 'critical': results = allProducts.filter(function(p) { var s = p.quantityOnHand || 0; return s > 0 && s < 10; }); break;
        case 'instock': results = allProducts.filter(function(p) { return (p.quantityOnHand || 0) > 0; }); break;
        case 'outofstock': results = allProducts.filter(function(p) { return (p.quantityOnHand || 0) === 0; }); break;
        case 'expiring': results = allProducts.filter(function(p) {
            if (!p.expiryDate) return false;
            var expiry = new Date(p.expiryDate);
            return expiry > today && expiry <= thirtyDays && (p.quantityOnHand || 0) > 0;
        }); break;
        default: results = allProducts;
    }
    document.getElementById('resultCountText').textContent = results.length + ' products found';
    renderSearchResults(results);
}

function renderSearchResults(products) {
    var container = document.getElementById('searchResults');
    if (!container) return;
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="search-empty"><i class="fas fa-search"></i><p>No products found</p></div>';
        return;
    }
    var html = '';
    products.forEach(function(p) {
        var stock = p.quantityOnHand || 0;
        var status = '';
        var statusClass = '';
        if (stock <= 0) { status = 'OUT'; statusClass = 'status-out'; }
        else if (stock < 10) { status = 'CRITICAL'; statusClass = 'status-critical'; }
        else if (stock <= (p.minStock || 50)) { status = 'LOW'; statusClass = 'status-low'; }
        else { status = 'OK'; statusClass = 'status-ok'; }
        html += '<div class="search-row" onclick="alert(\'Product: ' + p.name + ' ' + (p.strength || '') + '\nStock: ' + stock + '\nCode: ' + (p.code || 'N/A') + '\nExpiry: ' + (p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A') + '\nPrice: MK ' + (p.sellingPrice || 0) + '\')">';
        html += '<div><div style="font-weight:500;font-size:14px;">' + p.name + ' ' + (p.strength || '') + '</div><div style="font-size:10px;color:var(--text-muted);">' + (p.dosageForm || '') + ' • ' + (p.unitOfIssue || '') + '</div></div>';
        html += '<div style="font-size:12px;color:var(--text-muted);">' + (p.code || '—') + '</div>';
        html += '<div style="font-size:12px;color:var(--text-muted);">' + (p.batchNumber || '—') + '</div>';
        html += '<div style="font-size:12px;color:var(--text-muted);">' + (p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '—') + '</div>';
        html += '<div style="font-size:15px;font-weight:700;color:' + (stock > 0 ? 'var(--gold)' : '#EF4444') + ';">' + stock + '</div>';
        html += '<div style="font-size:13px;color:var(--text-muted);">' + (p.sellingPrice || 0) + '</div>';
        html += '<div><span class="' + statusClass + '" style="font-size:10px;font-weight:600;padding:2px 10px;border-radius:20px;background:' + statusClass.replace('status-', '') + '15;">' + status + '</span></div>';
        html += '<div style="text-align:center;color:var(--text-muted);font-size:11px;"><i class="fas fa-chevron-right"></i></div>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function clearSearch() {
    var search = document.getElementById('searchQuery');
    if (search) search.value = '';
    document.getElementById('resultCountText').textContent = allProducts.length + ' products found';
    renderSearchResults(allProducts);
}

// ============================================================
// ADD PRODUCT
// ============================================================
function submitProduct() {
    var name = document.getElementById('prodName').value.trim();
    var strength = document.getElementById('prodStrength').value.trim();
    var category = document.getElementById('prodCategory').value;
    var dosageForm = document.getElementById('prodDosage').value;
    var unitOfIssue = document.getElementById('prodUnit').value;
    var dNote = document.getElementById('prodDNote').value.trim();
    var batch = document.getElementById('prodBatch').value.trim();
    var qtyReceived = parseInt(document.getElementById('prodQtyReceived').value) || 0;
    var qtyOnHand = parseInt(document.getElementById('prodQtyOnHand').value) || 0;
    var expiry = document.getElementById('prodExpiry').value;
    var supplier = document.getElementById('prodSupplier').value.trim();
    var minStock = parseInt(document.getElementById('prodMin').value) || 50;
    var maxStock = parseInt(document.getElementById('prodMax').value) || 500;
    var unitCost = parseFloat(document.getElementById('prodCost').value) || 0;
    var sellingPrice = parseFloat(document.getElementById('prodPrice').value) || 0;

    if (!name || !strength || !category || !dosageForm || !unitOfIssue) {
        alert('Please fill in all required fields.');
        return;
    }

    var token = localStorage.getItem('token');
    if (!token) { alert('Please login first.'); return; }

    var btn = document.querySelector('#addProductPage .btn-gold');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; btn.disabled = true; }

    fetch(API_URL + '/api/products', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, strength, category, dosageForm, unitOfIssue, dNote, batchNumber: batch, quantityReceived: qtyReceived, quantityOnHand: qtyOnHand, expiryDate: expiry, supplier, minStock, maxStock, unitCost, sellingPrice })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            alert('✅ Product added successfully!\n\n' + data.data.name + ' ' + data.data.strength + '\nCode: ' + data.data.code);
            clearProductForm();
        } else {
            alert('❌ Error: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error) { alert('❌ Network error: ' + error.message); })
    .finally(function() {
        var btn = document.querySelector('#addProductPage .btn-gold');
        if (btn) { btn.innerHTML = '<i class="fas fa-save"></i> Add Product'; btn.disabled = false; }
    });
}

function clearProductForm() {
    var fields = ['prodName','prodStrength','prodCategory','prodDosage','prodUnit','prodDNote','prodBatch','prodQtyReceived','prodQtyOnHand','prodExpiry','prodSupplier','prodMin','prodMax','prodCost','prodPrice'];
    fields.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT') el.value = '';
            else if (el.type === 'number') el.value = '0';
            else if (el.type === 'date') el.value = '';
            else el.value = '';
        }
    });
    var min = document.getElementById('prodMin');
    var max = document.getElementById('prodMax');
    if (min) min.value = '50';
    if (max) max.value = '500';
}

// ============================================================
// STOCK CARD - COMPLETE
// ============================================================
var stockCardProducts = [];
var selectedStockCardProduct = null;

function searchStockCardProducts(query) {
    var dropdown = document.getElementById('stockCardDropdown');
    if (!dropdown) return;
    var searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
        dropdown.style.display = 'none';
        return;
    }
    var token = localStorage.getItem('token');
    if (!token) return;
    fetch(API_URL + '/api/products', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data && data.success) {
            stockCardProducts = data.data;
            var filtered = stockCardProducts.filter(function(p) {
                var name = (p.name || '').toLowerCase();
                var strength = (p.strength || '').toLowerCase();
                var code = (p.code || '').toLowerCase();
                return name.includes(searchTerm) || strength.includes(searchTerm) || code.includes(searchTerm);
            });
            if (filtered.length === 0) {
                dropdown.innerHTML = '<div style="padding:10px 14px;color:var(--text-muted);">No products found</div>';
                dropdown.style.display = 'block';
                return;
            }
            var html = '';
            filtered.forEach(function(p) {
                html += '<div style="padding:10px 16px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.03);font-size:15px;" onclick="selectStockCardProduct(\'' + p._id + '\')" onmouseover="this.style.background=\'rgba(214,158,46,0.05)\'" onmouseout="this.style.background=\'transparent\'">';
                html += '<div style="font-weight:500;color:var(--white);">' + p.name + ' ' + (p.strength || '') + '</div>';
                html += '<div style="font-size:13px;color:var(--text-muted);">Code: ' + (p.code || 'N/A') + ' | Stock: ' + (p.quantityOnHand || 0) + ' units</div>';
                html += '</div>';
            });
            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        }
    })
    .catch(function(error) {
        console.error('Error searching products:', error);
    });
}

function selectStockCardProduct(productId) {
    var product = stockCardProducts.find(function(p) { return p._id === productId; });
    if (product) {
        selectedStockCardProduct = product;
        document.getElementById('stockCardSearch').value = product.name + ' ' + (product.strength || '');
        document.getElementById('stockCardDropdown').style.display = 'none';
        viewStockCard();
    }
}

function viewStockCard() {
    var product = selectedStockCardProduct;
    if (!product) {
        var searchValue = document.getElementById('stockCardSearch').value.trim();
        if (searchValue) {
            var found = stockCardProducts.find(function(p) {
                var fullName = p.name + ' ' + (p.strength || '');
                return fullName === searchValue || p.name.toLowerCase() === searchValue.toLowerCase();
            });
            if (found) {
                product = found;
                selectedStockCardProduct = found;
            }
        }
    }
    if (!product) {
        alert('Please search and select a product first.');
        return;
    }
    var token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first.');
        return;
    }
    var header = document.getElementById('stockCardHeader');
    var transactions = document.getElementById('stockCardTransactions');
    var empty = document.getElementById('stockCardEmpty');
    var list = document.getElementById('stockCardTransactionList');
    if (header) header.style.display = 'block';
    if (transactions) transactions.style.display = 'flex';
    if (empty) empty.style.display = 'none';
    if (list) list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Loading transactions...</div>';
    var nameEl = document.getElementById('stockCardProductName');
    var strengthEl = document.getElementById('stockCardStrength');
    var dosageEl = document.getElementById('stockCardDosage');
    var unitEl = document.getElementById('stockCardUnit');
    var codeEl = document.getElementById('stockCardCode');
    var categoryEl = document.getElementById('stockCardCategory');
    var stockEl = document.getElementById('stockCardCurrentStock');
    var minEl = document.getElementById('stockCardMinStock');
    var maxEl = document.getElementById('stockCardMaxStock');
    if (nameEl) nameEl.textContent = product.name || '-';
    if (strengthEl) strengthEl.textContent = product.strength || '-';
    if (dosageEl) dosageEl.textContent = product.dosageForm || '-';
    if (unitEl) unitEl.textContent = product.unitOfIssue || '-';
    if (codeEl) codeEl.textContent = product.code || '-';
    if (categoryEl) categoryEl.textContent = product.category || '-';
    if (stockEl) stockEl.textContent = product.quantityOnHand || 0;
    if (minEl) minEl.textContent = product.minStock || '-';
    if (maxEl) maxEl.textContent = product.maxStock || '-';
    fetch(API_URL + '/api/transactions?productId=' + product._id, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data && data.success) {
            renderStockCardTransactions(data.data || []);
        } else {
            if (list) list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">No transactions found</div>';
        }
    })
    .catch(function(error) {
        console.error('Error loading transactions:', error);
        if (list) list.innerHTML = '<div style="text-align:center;padding:40px;color:#EF4444;">Error loading transactions</div>';
    });
}

function renderStockCardTransactions(transactions) {
    var container = document.getElementById('stockCardTransactionList');
    if (!container) return;
    var totalReceived = 0;
    var totalIssued = 0;
    var totalLosses = 0;
    var totalAdjustment = 0;
    var balance = 0;
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">No transactions found</div>';
        return;
    }
    transactions.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    var html = '';
    transactions.forEach(function(tx) {
        var date = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A';
        var dNote = tx.dNote || tx.reference || '-';
        var fromTo = tx.from || tx.to || '-';
        var quantity = tx.quantity || 0;
        var batch = tx.batchNumber || '-';
        var expiry = tx.expiryDate ? new Date(tx.expiryDate).toLocaleDateString() : '-';
        var remarks = tx.remarks || '-';
        var officer = tx.officer || '-';
        var signature = tx.signature || '-';
        var type = tx.type || 'unknown';
        var qtyReceived = type === 'received' ? quantity : 0;
        var qtyIssued = type === 'issued' ? quantity : 0;
        var losses = 0;
        var adjustment = 0;
        if (type === 'received') {
            balance += quantity;
            totalReceived += quantity;
        } else if (type === 'issued') {
            balance -= quantity;
            totalIssued += quantity;
        }
        html += '<div class="stock-card-transaction-item">';
        html += '<div class="date">' + date + '</div>';
        html += '<div style="color:var(--text-muted);font-size:9px;">' + dNote + '</div>';
        html += '<div style="color:var(--text-muted);font-size:9px;">' + fromTo + '</div>';
        html += '<div class="received">' + (qtyReceived > 0 ? qtyReceived : '-') + '</div>';
        html += '<div style="color:var(--text-muted);font-size:9px;">' + batch + '</div>';
        html += '<div style="color:var(--text-muted);font-size:9px;">' + expiry + '</div>';
        html += '<div class="issued">' + (qtyIssued > 0 ? qtyIssued : '-') + '</div>';
        html += '<div style="color:#EF4444;font-size:10px;">' + (losses > 0 ? losses : '-') + '</div>';
        html += '<div style="color:#F59E0B;font-size:10px;">' + (adjustment !== 0 ? adjustment : '-') + '</div>';
        html += '<div class="balance">' + balance + '</div>';
        html += '<div style="color:var(--text-muted);font-size:8px;">' + remarks + '</div>';
        html += '<div style="color:var(--text-muted);font-size:9px;">' + officer + '</div>';
        html += '<div style="color:var(--text-muted);font-size:9px;">' + signature + '</div>';
        html += '</div>';
    });
    container.innerHTML = html;
    var recEl = document.getElementById('stockCardTotalReceived');
    var issEl = document.getElementById('stockCardTotalIssued');
    var lossEl = document.getElementById('stockCardTotalLosses');
    var adjEl = document.getElementById('stockCardTotalAdjustment');
    var balEl = document.getElementById('stockCardTotalBalance');
    if (recEl) recEl.textContent = totalReceived;
    if (issEl) issEl.textContent = totalIssued;
    if (lossEl) lossEl.textContent = totalLosses;
    if (adjEl) adjEl.textContent = totalAdjustment;
    if (balEl) balEl.textContent = balance;
}

function clearStockCard() {
    var search = document.getElementById('stockCardSearch');
    var dropdown = document.getElementById('stockCardDropdown');
    var header = document.getElementById('stockCardHeader');
    var transactions = document.getElementById('stockCardTransactions');
    var empty = document.getElementById('stockCardEmpty');
    if (search) search.value = '';
    if (dropdown) dropdown.style.display = 'none';
    if (header) header.style.display = 'none';
    if (transactions) transactions.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    selectedStockCardProduct = null;
}

function printStockCard() {
    window.print();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('💊 MedOx Pharmacy v2.0');
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');
    if (token && user) {
        var landingPage = document.getElementById('landing');
        if (landingPage && landingPage.classList.contains('active')) {
            navigateTo('dashboard');
        }
    }
});

console.log('✅ All functions loaded!');
