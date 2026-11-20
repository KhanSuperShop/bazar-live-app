(function () {
    // ⚠️ এখানে আপনার index.js ফাইল থেকে Supabase URL এবং Key বসিয়ে দিন:
    const SUPABASE_URL = "https://kuecacvhadqzywvkmauo.supabase.co"; 
    const SUPABASE_ANON_KEY = "sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI";

    const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    // ১. এডিট পপ-আপের জন্য প্রয়োজনীয় HTML যুক্ত করা
    const modalHTML = `
        <div id="custom-order-edit-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:999999; justify-content:center; align-items:center; font-family:sans-serif;">
            <div style="background:#fff; width:92%; max-width:420px; border-radius:10px; padding:20px; box-shadow:0 5px 20px rgba(0,0,0,0.3); max-height:85vh; overflow-y:auto; color:#333;">
                <h3 style="margin-top:0; color:#2e7d32; border-bottom:1px solid #eee; padding-bottom:10px;">✏️ অর্ডার #<span id="edit-order-id"></span> এডিট করুন</h3>
                
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
                    <small style="color:#666; font-size:11px;">* ১০০০+ টাকার অর্ডারে ডেলিভারি চার্জ ফ্রি (অন্যথায় ৳৩০ যুক্ত হবে)</small>
                </div>

                <div style="display:flex; gap:10px;">
                    <button id="save-edited-order-btn" style="flex:1; background:#2e7d32; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">✅ আপডেট করুন</button>
                    <button id="cancel-edit-order-btn" style="flex:1; background:#6c757d; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">বাতিল</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    let currentOrder = null;
    let currentItems = [];

    // ২. শুধুমাত্র পেন্ডিং অর্ডারের নিচে এডিট বাটন বসিয়ে দেওয়া
    setInterval(() => {
        const allElements = document.querySelectorAll('div, p, h4, h5, span, strong, b');
        allElements.forEach(el => {
            if (el.children.length === 0 && /অর্ডার\s*#\d+/.test(el.textContent)) {
                let card = el.closest('div[style*="border"]') || el.parentElement.parentElement || el.parentElement;
                if (!card || card.dataset.editInjected) return;

                const match = el.textContent.match(/#(\d+)/);
                if (match && match[1]) {
                    const orderId = match[1];
                    card.dataset.editInjected = "true";

                    // অর্ডারটি সম্পন্ন বা Confirmed হলে বাটন দেখাবে না
                    if (card.innerText.includes('সম্পন্ন') || card.innerText.includes('Confirmed')) return;

                    const editBtn = document.createElement('button');
                    editBtn.type = 'button';
                    editBtn.innerHTML = '✏️ অর্ডার এডিট করুন';
                    editBtn.style.cssText = 'background:#ff9800; color:#fff; border:none; padding:6px 12px; border-radius:5px; font-size:12px; font-weight:bold; cursor:pointer; margin-top:8px; display:block; width:100%;';
                    
                    editBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(orderId);
                    };
                    card.appendChild(editBtn);
                }
            }
        });
    }, 500);

    // ৩. সরাসরি REST API দিয়ে অর্ডারের তথ্য এনে এডিট মোডাল ওপেন করা
    async function openEditModal(orderId) {
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
            alert('দয়া করে order-edit.js ফাইলে আপনার Supabase URL এবং Key বসিয়ে নিন!');
            return;
        }

        try {
            const response = await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${orderId}&select=*`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                alert('অর্ডারের তথ্য লোড করা যায়নি!');
                return;
            }

            const result = await response.json();
            const data = result[0];

            if (!data) {
                alert('অর্ডারটি খুঁজে পাওয়া যায়নি!');
                return;
            }

            if (data.status !== 'pending') {
                alert('দুঃখিত, এই অর্ডারটি ইতিমধ্যে কনফার্ম বা সম্পন্ন হয়ে গেছে, তাই আর এডিট করা যাবে না।');
                return;
            }

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

    // ৪. পণ্যের তালিকা ও পরিমাণ (+/-) রেন্ডার করা
    function renderEditItems() {
        const listDiv = document.getElementById('edit-items-list');
        listDiv.innerHTML = '';
        let subtotal = 0;

        currentItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const row = document.createElement('div');
            row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee; font-size:13px;';
            row.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight:bold;">${item.title}</div>
                    <div style="color:#666;">৳${item.price} x ${item.quantity} = ৳${itemTotal}</div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button type="button" onclick="window._updateEditQty(${index}, -1)" style="width:28px; height:28px; border:1px solid #ccc; background:#f1f1f1; border-radius:4px; cursor:pointer; font-weight:bold;">-</button>
                    <span style="min-width:20px; text-align:center; font-weight:bold;">${item.quantity}</span>
                    <button type="button" onclick="window._updateEditQty(${index}, 1)" style="width:28px; height:28px; border:1px solid #ccc; background:#f1f1f1; border-radius:4px; cursor:pointer; font-weight:bold;">+</button>
                    <button type="button" onclick="window._removeEditItem(${index})" style="background:#ffebee; color:#d32f2f; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:4px;">🗑️</button>
                </div>
            `;
            listDiv.appendChild(row);
        });

        const deliveryCharge = subtotal > 0 ? (subtotal >= 1000 ? 0 : 30) : 0;
        const grandTotal = subtotal + deliveryCharge;
        document.getElementById('edit-order-total').innerText = grandTotal;
    }

    window._updateEditQty = function (index, change) {
        if (currentItems[index].quantity + change <= 0) {
            window._removeEditItem(index);
        } else {
            currentItems[index].quantity += change;
            renderEditItems();
        }
    };

    window._removeEditItem = function (index) {
        if (currentItems.length === 1) {
            alert('অর্ডারে অন্তত ১টি পণ্য থাকতে হবে!');
            return;
        }
        currentItems.splice(index, 1);
        renderEditItems();
    };

    // ৫. সরাসরি PATCH রিকোয়েস্ট দিয়ে Supabase-এ অর্ডার আপডেট করা
    document.getElementById('save-edited-order-btn').onclick = async function () {
        const newAddress = document.getElementById('edit-order-address').value.trim();
        const newTotal = Number(document.getElementById('edit-order-total').innerText);

        if (!newAddress) {
            alert('দয়া করে ডেলিভারি ঠিকানা লিখুন।');
            return;
        }

        const btn = this;
        btn.innerText = 'আপডেট হচ্ছে...';
        btn.disabled = true;

        try {
            const response = await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${currentOrder.id}&status=eq.pending`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({
                    items: currentItems,
                    total_amount: newTotal,
                    delivery_address: newAddress
                })
            });

            btn.innerText = '✅ আপডেট করুন';
            btn.disabled = false;

            if (!response.ok) {
                const errData = await response.json();
                alert('আপডেট করতে সমস্যা হয়েছে: ' + (errData.message || 'RLS Policy চেক করুন'));
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
           document.getElementById('cancel-edit-order-btn').onclick = function () {
           document.getElementById('custom-order-edit-modal').style.display = 'none';
      };
})();
