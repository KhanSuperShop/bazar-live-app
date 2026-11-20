(function () {
    const URL = "https://kuecacvhadqzywvkmauo.supabase.co";
    const KEY = "sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI";
    const headers = {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const modalHTML = `
        <div id="custom-order-edit-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:999999; justify-content:center; align-items:center; font-family:sans-serif;">
            <div style="background:#fff; width:92%; max-width:430px; border-radius:10px; padding:18px; box-shadow:0 5px 20px rgba(0,0,0,0.3); max-height:88vh; overflow-y:auto; color:#333;">
                <h3 style="margin-top:0; color:#2e7d32; border-bottom:1px solid #eee; padding-bottom:10px;">✏️ অর্ডার #<span id="edit-order-id"></span> এডিট করুন</h3>
                
                <!-- নতুন পণ্য যোগ করার সেকশন -->
                <div style="background:#e8f5e9; padding:10px; border-radius:6px; margin-bottom:12px; border:1px solid #c8e6c9;">
                    <label style="display:block; font-weight:bold; font-size:12px; color:#2e7d32; margin-bottom:5px;">➕ অর্ডারে নতুন পণ্য যোগ করুন:</label>
                    <div style="display:flex; gap:6px;">
                        <select id="edit-new-product-select" style="flex:1; padding:7px; border:1px solid #ccc; border-radius:5px; font-size:13px; background:#fff;">
                            <option value="">পণ্য লোড হচ্ছে...</option>
                        </select>
                        <button type="button" id="add-new-item-to-order-btn" style="background:#2e7d32; color:#fff; border:none; padding:7px 12px; border-radius:5px; font-weight:bold; cursor:pointer; font-size:13px; white-space:nowrap;">+ যোগ করুন</button>
                    </div>
                </div>

                <div id="edit-items-list" style="margin-bottom:15px;"></div>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-weight:bold; font-size:13px; margin-bottom:4px;">ডেলিভারি ঠিকানা:</label>
                    <textarea id="edit-order-address" rows="2" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;"></textarea>
                </div>

                <div style="background:#f8f9fa; padding:10px; border-radius:6px; margin-bottom:15px; font-size:14px;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold; color:#d32f2f; font-size:16px;">
                        <span>নতুন সর্বমোট বিল:</span>
                        <span>৳<span id="edit-order-total">0</span> টাকা</span>
                    </div>
                    <small style="color:#666; font-size:11px;">* ১০০০+ টাকার অর্ডারে ডেলিভারি চার্জ ফ্রি (নাহলে ৳৩০)</small>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <button id="save-edited-order-btn" style="flex:1; background:#2e7d32; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px;">✅ আপডেট করুন</button>
                    <button id="cancel-edit-order-btn" style="flex:1; background:#6c757d; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px;">বন্ধ করুন</button>
                </div>

                <!-- অর্ডার বাতিল করার বাটন -->
                <button type="button" id="delete-cancel-order-btn" style="width:100%; background:#ffebee; color:#c62828; border:1px solid #ef9a9a; padding:9px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:13px;">❌ অর্ডারটি সম্পূর্ণ বাতিল করুন</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    let currentOrder = null;
    let currentItems = [];
    let allShopProducts = [];

    setInterval(() => {
        document.querySelectorAll('div, p, h4, h5, span, strong, b').forEach(async (el) => {
            if (el.children.length === 0 && /অর্ডার\s*#\d+/.test(el.textContent)) {
                let card = el.closest('div[style*="border"]') || el.parentElement.parentElement || el.parentElement;
                if (!card || card.dataset.editChecked) return;

                const orderId = el.textContent.split('#').pop().replace(/\D/g, '');
                if (orderId) {
                    card.dataset.editChecked = "true";

                    try {
                        const res = await fetch(`${URL}/rest/v1/orders?id=eq.${orderId}&select=status`, { headers });
                        if (res.ok) {
                            const rows = await res.json();
                            const orderRow = rows.shift();
                            if (orderRow && orderRow.status === 'pending') {
                                if (el.innerHTML.includes('সম্পন্ন')) {
                                    el.innerHTML = el.innerHTML.replace('✅ সম্পন্ন', '⏳ অপেক্ষমাণ').replace('সম্পন্ন', 'অপেক্ষমাণ');
                                }
                                const editBtn = document.createElement('button');
                                editBtn.type = 'button';
                                editBtn.innerHTML = '✏️ অর্ডার এডিট / বাতিল করুন';
                                editBtn.style.cssText = 'background:#ff9800; color:#fff; border:none; padding:6px 12px; border-radius:5px; font-size:12px; font-weight:bold; cursor:pointer; margin-top:8px; display:block; width:100%;';
                                editBtn.onclick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openEditModal(orderId);
                                };
                                card.appendChild(editBtn);
                            } else if (orderRow && orderRow.status === 'cancelled') {
                                if (el.innerHTML.includes('সম্পন্ন')) {
                                    el.innerHTML = el.innerHTML.replace('✅ সম্পন্ন', '❌ বাতিলকৃত').replace('সম্পন্ন', 'বাতিলকৃত');
                                }
                            }
                        }
                    } catch (err) {}
                }
            }
        });
    }, 600);
    async function loadProductsDropdown() {
        const selectEl = document.getElementById('edit-new-product-select');
        if (allShopProducts.length > 0) return;

        try {
            const res = await fetch(`${URL}/rest/v1/products?select=*`, { headers });
            if (res.ok) {
                allShopProducts = await res.json();
                selectEl.innerHTML = '<option value="">-- পণ্য নির্বাচন করুন --</option>';
                allShopProducts.forEach((p, idx) => {
                    const pName = p.title || p.name || 'পণ্য';
                    const pPrice = p.price || 0;
                    const opt = document.createElement('option');
                    opt.value = idx;
                    opt.textContent = `${pName} (৳${pPrice})`;
                    selectEl.appendChild(opt);
                });
            }
        } catch (e) {
            selectEl.innerHTML = '<option value="">পণ্য লোড হয়নি</option>';
        }
    }

    document.getElementById('add-new-item-to-order-btn').onclick = function () {
        const selectEl = document.getElementById('edit-new-product-select');
        if (selectEl.value === '') return alert('দয়া করে তালিকা থেকে একটি পণ্য সিলেক্ট করুন।');

        const selectedProd = allShopProducts[Number(selectEl.value)];
        const pTitle = selectedProd.title || selectedProd.name;
        const pPrice = Number(selectedProd.price);

        const existingIndex = currentItems.findIndex(item => item.title === pTitle);
        if (existingIndex !== -1) {
            currentItems[existingIndex].quantity += 1;
        } else {
            currentItems.push({
                id: selectedProd.id,
                title: pTitle,
                price: pPrice,
                quantity: 1
            });
        }
        selectEl.value = '';
        renderEditItems();
    };

    async function openEditModal(orderId) {
        try {
            loadProductsDropdown();
            const response = await fetch(`${URL}/rest/v1/orders?id=eq.${orderId}&select=*`, { headers });
            if (!response.ok) return alert('অর্ডারের তথ্য লোড করা যায়নি!');
            const result = await response.json();
            const data = result.shift();
            if (!data || data.status !== 'pending') return alert('এই অর্ডারটি আর এডিট বা বাতিল করা যাবে না।');

            currentOrder = data;
            currentItems = Array.isArray(data.items) ? JSON.parse(JSON.stringify(data.items)) : [];
            document.getElementById('edit-order-id').innerText = data.id;
            document.getElementById('edit-order-address').value = data.delivery_address || '';
            renderEditItems();
            document.getElementById('custom-order-edit-modal').style.display = 'flex';
        } catch (err) {
            alert('নেটওয়ার্ক সমস্যা: ' + err.message);
        }
    }

    function renderEditItems() {
        const listDiv = document.getElementById('edit-items-list');
        listDiv.innerHTML = '';

        currentItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee; font-size:13px; gap:8px;';
            row.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight:bold;">${item.title}</div>
                    <div style="color:#666;">৳${item.price} x <span id="edit-qty-label-${index}">${item.quantity}</span> = ৳<span id="edit-row-total-${index}">${itemTotal}</span></div>
                </div>
                <div style="display:flex; align-items:center; gap:4px;">
                    <button type="button" onclick="window._updateEditQty(${index}, -1)" style="width:28px; height:30px; border:1px solid #ccc; background:#f1f1f1; border-radius:4px; cursor:pointer; font-weight:bold; font-size:15px;">-</button>
                    <input type="number" min="1" value="${item.quantity}" oninput="window._setExactEditQty(${index}, this.value)" onblur="window._validateEditQty(${index}, this)" style="width:54px; height:30px; text-align:center; font-weight:bold; border:1px solid #bbb; border-radius:4px; font-size:13px; padding:0 2px; box-sizing:border-box;">
                    <button type="button" onclick="window._updateEditQty(${index}, 1)" style="width:28px; height:30px; border:1px solid #ccc; background:#f1f1f1; border-radius:4px; cursor:pointer; font-weight:bold; font-size:15px;">+</button>
                    <button type="button" onclick="window._removeEditItem(${index})" style="background:#ffebee; color:#d32f2f; border:none; padding:6px 8px; border-radius:4px; cursor:pointer; margin-left:2px;">🗑️</button>
                </div>
            `;
            listDiv.appendChild(row);
        });

        recalculateEditTotal();
    }

    function recalculateEditTotal() {
        let subtotal = 0;
        currentItems.forEach((item) => {
            subtotal += item.price * item.quantity;
        });
        const deliveryCharge = subtotal > 0 ? (subtotal >= 1000 ? 0 : 30) : 0;
        document.getElementById('edit-order-total').innerText = subtotal + deliveryCharge;
    }

    window._setExactEditQty = function (index, val) {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num >= 1) {
            currentItems[index].quantity = num;
            document.getElementById(`edit-qty-label-${index}`).innerText = num;
            document.getElementById(`edit-row-total-${index}`).innerText = currentItems[index].price * num;
            recalculateEditTotal();
        }
    };

    window._validateEditQty = function (index, inputEl) {
        const num = parseInt(inputEl.value, 10);
        if (isNaN(num) || num < 1) {
            currentItems[index].quantity = 1;
            inputEl.value = 1;
            document.getElementById(`edit-qty-label-${index}`).innerText = 1;
            document.getElementById(`edit-row-total-${index}`).innerText = currentItems[index].price;
            recalculateEditTotal();
        }
    };

    window._updateEditQty = function (index, change) {
        if (currentItems[index].quantity + change <= 0) {
            window._removeEditItem(index);
        } else {
            currentItems[index].quantity += change;
            renderEditItems();
        }
    };

    window._removeEditItem = function (index) {
        if (currentItems.length === 1) return alert('অর্ডারে অন্তত ১টি পণ্য থাকতে হবে! অথবা নিচের বাটন থেকে পুরো অর্ডারটি বাতিল করুন।');
        currentItems.splice(index, 1);
        renderEditItems();
    };

    // অর্ডার আপডেট সেভ করা
    document.getElementById('save-edited-order-btn').onclick = async function () {
        const newAddress = document.getElementById('edit-order-address').value.trim();
        const newTotal = Number(document.getElementById('edit-order-total').innerText);
        if (!newAddress) return alert('দয়া করে ডেলিভারি ঠিকানা লিখুন।');

        const btn = this;
        btn.innerText = 'আপডেট হচ্ছে...';
        btn.disabled = true;

        try {
            const response = await fetch(`${URL}/rest/v1/orders?id=eq.${currentOrder.id}&status=eq.pending`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ items: currentItems, total_amount: newTotal, delivery_address: newAddress })
            });

            btn.innerText = '✅ আপডেট করুন';
            btn.disabled = false;

            if (!response.ok) {
                const errData = await response.json();
                alert('সমস্যা হয়েছে: ' + (errData.message || 'আপডেট ব্যর্থ হয়েছে'));
            } else {
                alert('আপনার অর্ডারটি সফলভাবে আপডেট করা হয়েছে!');
                document.getElementById('custom-order-edit-modal').style.display = 'none';
                location.reload();
            }
        } catch (err) {
            btn.innerText = '✅ আপডেট করুন';
            btn.disabled = false;
            alert('নেটওয়ার্ক এরর: ' + err.message);
        }
    };

    // অর্ডার সম্পূর্ণ বাতিল করা
    document.getElementById('delete-cancel-order-btn').onclick = async function () {
        const isConfirmed = confirm(`আপনি কি নিশ্চিত যে অর্ডার #${currentOrder.id} সম্পূর্ণ বাতিল করতে চান?`);
        if (!isConfirmed) return;

        const btn = this;
        btn.innerText = 'বাতিল হচ্ছে...';
        btn.disabled = true;

        try {
            const response = await fetch(`${URL}/rest/v1/orders?id=eq.${currentOrder.id}&status=eq.pending`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ status: 'cancelled' })
            });

            btn.innerText = '❌ অর্ডারটি সম্পূর্ণ বাতিল করুন';
            btn.disabled = false;

            if (!response.ok) {
                const errData = await response.json();
                alert('বাতিল করতে সমস্যা হয়েছে: ' + (errData.message || 'RLS Policy চেক করুন'));
            } else {
                alert(`অর্ডার #${currentOrder.id} সফলভাবে বাতিল করা হয়েছে!`);
                document.getElementById('custom-order-edit-modal').style.display = 'none';
                location.reload();
            }
        } catch (err) {
            btn.innerText = '❌ অর্ডারটি সম্পূর্ণ বাতিল করুন';
            btn.disabled = false;
            alert('নেটওয়ার্ক এরর: ' + err.message);
        }
    };

    document.getElementById('cancel-edit-order-btn').onclick = function () {
        document.getElementById('custom-order-edit-modal').style.display = 'none';
    };
})();
