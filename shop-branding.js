(function() {
    const SB_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
    const SB_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI';
    // ১. দোকানের নাম, ঠিকানা, ফোন ও অফার ব্যানার লোড
    async function applyShopSettings() {
        try {
            const res = await fetch(SB_URL + '/rest/v1/shop_settings?select=*', {
                headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return;

            const s = data[0];
            const shopName = s.shop_name || s.name || 'খান সুপার শপ';
            const shopPhone = s.phone || s.shop_phone || s.mobile || '';
            const shopAddress = s.address || s.shop_address || '';
            const bannerText = s.banner_text || s.offer_text || s.notice || '';

            document.title = shopName;

            const headerEl = document.querySelector('header h1, header .logo, header');
            if (headerEl) {
                const h1 = headerEl.querySelector('h1');
                if (h1) h1.innerText = shopName;
                else if (headerEl.children.length === 0) headerEl.innerText = shopName;

                if ((shopAddress || shopPhone) && !document.getElementById('dynamic-shop-contact')) {
                    const contactDiv = document.createElement('div');
                    contactDiv.id = 'dynamic-shop-contact';
                    contactDiv.style.cssText = 'font-size: 13px; font-weight: normal; margin-top: 4px; opacity: 0.9;';
                    contactDiv.innerText = [shopAddress, shopPhone ? '📞 ' + shopPhone : ''].filter(Boolean).join('  |  ');
                    headerEl.appendChild(contactDiv);
                }
            }

            if (bannerText && bannerText.trim() !== '') {
                let bannerBar = document.getElementById('dynamic-offer-banner');
                if (!bannerBar) {
                    bannerBar = document.createElement('div');
                    bannerBar.id = 'dynamic-offer-banner';
                    bannerBar.style.cssText = 'background: #dc2626; color: #fff; padding: 8px 15px; text-align: center; font-weight: bold; font-size: 15px;';
                    const header = document.querySelector('header');
                    if (header && header.nextSibling) {
                        header.parentNode.insertBefore(bannerBar, header.nextSibling);
                    } else {
                        document.body.prepend(bannerBar);
                    }
                }
                bannerBar.innerHTML = '<marquee behavior="scroll" direction="left" scrollamount="5">🎉 ' + bannerText + '</marquee>';
            }

            if (s.delivery_charge !== undefined) shopDeliveryCharge = Number(s.delivery_charge);
            if (s.free_delivery_limit !== undefined) shopFreeLimit = Number(s.free_delivery_limit);
        } catch (err) {
            console.error('সেটিংস লোড সমস্যা:', err);
        }
    }

    // ২. ডেলিভারি চার্জ ও ফ্রি ডেলিভারি অটো-ক্যালকুলেটর
    let shopDeliveryCharge = 50;
    let shopFreeLimit = 1000;

    function updateDeliveryUI() {
        const totalEl = document.getElementById('total-price');
        if (!totalEl) return;

        const subTotal = Number(totalEl.innerText) || 0;
        let infoBox = document.getElementById('delivery-charge-info');

        if (!infoBox) {
            infoBox = document.createElement('div');
            infoBox.id = 'delivery-charge-info';
            infoBox.style.cssText = 'margin: 8px 0; padding: 8px 10px; background: #f0fdf4; border: 1px dashed #16a34a; border-radius: 5px; font-size: 13px; color: #166534;';
            totalEl.parentElement.insertAdjacentElement('afterend', infoBox);
        }

        if (subTotal === 0) {
            infoBox.innerHTML = `🚚 ডেলিভারি চার্জ: <b>৳${shopDeliveryCharge}</b> (৳${shopFreeLimit}+ অর্ডারে <b>ফ্রি!</b>)`;
        } else if (subTotal >= shopFreeLimit) {
            infoBox.innerHTML = `🎉 অভিনন্দন! আপনি <b>ফ্রি ডেলিভারি</b> পেয়েছেন!<br>সর্বমোট পরিশোধযোগ্য: <b>৳${subTotal} টাকা</b>`;
        } else {
            const needMore = shopFreeLimit - subTotal;
            const grandTotal = subTotal + shopDeliveryCharge;
            infoBox.innerHTML = `🚚 ডেলিভারি চার্জ: <b>৳${shopDeliveryCharge}</b> (আরও ৳${needMore} কিনলে ডেলিভারি ফ্রি!)<br>💰 <b>ডেলিভারিসহ মোট বিল: ৳${grandTotal} টাকা</b>`;
        }
    }

    // ৩. স্টক আউট ও ডিসকাউন্ট ব্যাজ
    let outOfStockTitles = [];
    let discountProductsMap = {};

    async function loadProductStatuses() {
        try {
            const res = await fetch(SB_URL + '/rest/v1/products?select=title,price,old_price,in_stock', {
                headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                outOfStockTitles = data.filter(p => p.in_stock === false).map(p => p.title.trim().toLowerCase());
                data.forEach(p => {
                    if (p.old_price && Number(p.old_price) > Number(p.price)) {
                        discountProductsMap[p.title.trim().toLowerCase()] = { price: p.price, old_price: p.old_price };
                    }
                });
            }
        } catch (e) {}
    }

        function applyProductBadges() {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.innerText.includes('কার্টে যোগ করুন') || btn.innerText.includes('স্টক শেষ')) {
                const card = btn.parentElement;
                if (!card) return;
                const cardText = card.innerText.toLowerCase();

                // স্টক আউট চেক
                if (outOfStockTitles.some(title => cardText.includes(title))) {
                    btn.disabled = true;
                    btn.innerText = '❌ স্টক শেষ';
                    btn.style.backgroundColor = '#dc2626';
                    btn.style.cursor = 'not-allowed';
                }

                // ডিসকাউন্ট (%) ব্যাজ ও পুরোনো দাম কেটে নতুন দাম দেখানো
                if (!card.dataset.discountApplied) {
                    const headingText = (card.querySelector('h3, h4')?.innerText || cardText).trim().toLowerCase();

                    for (const [title, info] of Object.entries(discountProductsMap)) {
                        if (headingText.includes(title) || cardText.includes(title)) {
                            const oldP = Number(info.old_price);
                            const newP = Number(info.price);
                            const percentOff = Math.round(((oldP - newP) / oldP) * 100);

                            // ১. ছবির ওপর লাল রঙের শতকরা ছাড় (%) ব্যাজ বসানো
                            card.style.position = 'relative';
                            if (percentOff > 0 && !card.querySelector('.offer-percent-badge')) {
                                const badge = document.createElement('div');
                                badge.className = 'offer-percent-badge';
                                badge.innerText = `🔥 ${percentOff}% ছাড়`;
                                badge.style.cssText = 'position: absolute; top: 8px; left: 8px; background: #dc2626; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); z-index: 5;';
                                card.appendChild(badge);
                            }

                            // ২. দামের এলিমেন্টটি সরাসরি খুঁজে পুরোনো দাম কাটা ও নতুন দাম বসানো
                            const priceEl = Array.from(card.querySelectorAll('p, span, div, h4, strong, b')).find(el => 
                                el.children.length === 0 && el.innerText.includes('৳')
                            );

                            if (priceEl) {
                                priceEl.innerHTML = `<del style="color:#888; font-size:13px; margin-right:6px;">৳${oldP}</del><span style="color:#dc2626; font-weight:bold; font-size:16px;">৳${newP}</span>`;
                            }

                            card.dataset.discountApplied = 'true';
                            break;
                        }
                    }
                }
            }
        });
    }
    // ৪. এক লাইনে ৪টি পণ্য দেখানোর গ্রিড স্টাইল
    const gridStyle = document.createElement('style');
    gridStyle.innerHTML = `
        @media (min-width: 900px) {
            #product-list, .product-grid, .products-grid {
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 12px !important;
            }
            #product-list > div, .product-grid > div, .products-grid > div {
                padding: 10px !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            #product-list img, .product-grid img, .products-grid img {
                height: 110px !important;
                object-fit: cover !important;
            }
            #product-list h3, .product-grid h3, .products-grid h3 {
                font-size: 14px !important;
                margin: 6px 0 4px 0 !important;
            }
            #product-list p, .product-grid p, .products-grid p {
                font-size: 12px !important;
                margin: 0 0 6px 0 !important;
            }
            #product-list button, .product-grid button, .products-grid button {
                padding: 6px 8px !important;
                font-size: 12px !important;
            }
        }
    `;
    document.head.appendChild(gridStyle);

    // ৫. স্মার্ট ক্যাটাগরি ফিল্টার বাটন ('অন্যান্য' সহ)
    function setupCategoryFilters() {
        const heading = Array.from(document.querySelectorAll('h2, h3')).find(el => el.innerText.includes('আমাদের পণ্যসমূহ'));
        if (!heading || document.getElementById('smart-category-bar')) return;

        const mainCategories = [
            { label: '🌾 চাল ও ডাল', keywords: ['চাল', 'ডাল', 'মসুর', 'খেসারি', 'মুগ', 'ছোলা'] },
            { label: '🛢️ তেল ও মসলা', keywords: ['তেল', 'সয়াবিন', 'সরিষা', 'লবণ', 'চিনি', 'হলুদ', 'মরিচ', 'মসলা', 'জিরা'] },
            { label: '🥖 আটা, ময়দা ও সুজি', keywords: ['আটা', 'ময়দা', 'ময়দা', 'সুজি', 'বিস্কুট', 'সেমাই'] },
            { label: '🧅 কাঁচাবাজার', keywords: ['পেঁয়াজ', 'পেঁয়াজ', 'রসুন', 'আদা', 'আলু', 'সবজি', 'টমেটো', 'কাঁচা'] }
        ];

        const allButtons = [
            { label: '🛒 সব পণ্য', type: 'all' },
            ...mainCategories.map(c => ({ ...c, type: 'normal' })),
            { label: '📦 অন্যান্য', type: 'others' }
        ];

        const bar = document.createElement('div');
        bar.id = 'smart-category-bar';
        bar.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 18px 0;';

        allButtons.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerText = cat.label;
            btn.style.cssText = index === 0
                ? 'background: #16a34a; color: white; border: 1px solid #16a34a; padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer;'
                : 'background: #fff; color: #333; border: 1px solid #ccc; padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer;';

                        btn.onclick = function() {
                bar.querySelectorAll('button').forEach(b => {
                    b.style.background = '#fff'; b.style.color = '#333'; b.style.borderColor = '#ccc';
                });
                btn.style.background = '#16a34a'; btn.style.color = 'white'; btn.style.borderColor = '#16a34a';

                const productGrid = document.querySelector('#product-list, .product-grid, .products-grid');
                if (!productGrid) return;

                Array.from(productGrid.children).forEach(card => {
                    const text = card.innerText.toLowerCase();
                    if (cat.type === 'all') {
                        card.style.display = '';
                    } else if (cat.type === 'normal') {
                        card.style.display = cat.keywords.some(kw => text.includes(kw)) ? '' : 'none';
                    } else if (cat.type === 'others') {
                        const inAnyMain = mainCategories.some(mc => mc.keywords.some(kw => text.includes(kw)));
                        card.style.display = !inAnyMain ? '' : 'none';
                    }
                });
            };
            bar.appendChild(btn);
        });

        heading.insertAdjacentElement('afterend', bar);
    }

        // ৬. কাস্টমারের জন্য "📋 আমার অর্ডার" বাটন (এডিট ও বাতিল করার সুবিধাসহ)
    function setupMyOrdersButton() {
        const header = document.querySelector('header');
        if (!header || document.getElementById('my-orders-btn')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'my-orders-btn';
        btn.innerHTML = '📋 আমার অর্ডার';
        btn.style.cssText = 'margin-top: 8px; background: #fff; color: #16a34a; border: none; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.15);';

        btn.onclick = async function() {
            const phone = prompt("আপনার অর্ডার দেখতে মোবাইল নাম্বারটি লিখুন:");
            if (!phone || !phone.trim()) return;

            try {
                const res = await fetch(`${SB_URL}/rest/v1/orders?phone_number=eq.${encodeURIComponent(phone.trim())}&select=*`, {
                    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
                });
                const orders = await res.json();

                if (!Array.isArray(orders) || orders.length === 0) {
                    return alert("এই নাম্বারে কোনো অর্ডার খুঁজে পাওয়া যায়নি!");
                }

                const existingModal = document.getElementById('my-orders-modal');
                if (existingModal) existingModal.remove();

                const modal = document.createElement('div');
                modal.id = 'my-orders-modal';
                modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; padding:15px;';

                const ordersHtml = orders.reverse().map(o => {
                    const date = o.created_at ? new Date(o.created_at).toLocaleDateString('bn-BD') : '';
                    const items = Array.isArray(o.items) ? o.items.map(i => `${i.title} (${i.quantity}টি)`).join(', ') : '';
                    const isPending = !o.status || o.status === 'Pending';

                    return `
                        <div style="background:#f9fafb; border:1px solid #ddd; border-left:4px solid ${isPending ? '#f59e0b' : '#16a34a'}; padding:12px; border-radius:6px; margin-bottom:10px; text-align:left; font-size:13px;">
                            <div style="display:flex; justify-content:space-between; font-weight:bold; color:#333;">
                                <span>অর্ডার #${o.id} (${isPending ? '⏳ অপেক্ষমাণ' : '✅ সম্পন্ন'})</span>
                                <span style="color:#666;">${date}</span>
                            </div>
                            <div style="margin:5px 0; color:#16a34a; font-weight:500;">${items}</div>
                            <div style="font-size:12px; color:#555; margin-bottom:4px;">📍 ঠিকানা: ${o.address || ''}</div>
                            <div style="font-weight:bold; color:#dc2626; margin-bottom:8px;">মোট বিল: ৳${o.total_amount} টাকা</div>
                            ${isPending ? `
                                <div style="display:flex; gap:8px;">
                                    <button type="button" onclick="customerEditOrder(${o.id}, '${String(o.address || '').replace(/'/g, "\\'")}')" style="flex:1; background:#2563eb; color:#fff; border:none; padding:6px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;">✏️ ঠিকানা/নোট এডিট</button>
                                    <button type="button" onclick="customerCancelOrder(${o.id})" style="flex:1; background:#dc2626; color:#fff; border:none; padding:6px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;">❌ অর্ডার বাতিল</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                modal.innerHTML = `
                    <div style="background:#fff; max-width:430px; width:100%; max-height:80vh; overflow-y:auto; padding:20px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                        <h3 style="margin-top:0; color:#16a34a; border-bottom:2px solid #16a34a; padding-bottom:8px;">📋 আপনার পূর্ববর্তী অর্ডারসমূহ</h3>
                        ${ordersHtml}
                        <button type="button" onclick="document.getElementById('my-orders-modal').remove()" style="width:100%; background:#374151; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">বন্ধ করুন</button>
                    </div>
                `;
                document.body.appendChild(modal);
            } catch (e) {
                alert("অর্ডার লোড করতে সমস্যা হয়েছে!");
            }
        };

        // কাস্টমারের ঠিকানা বা অতিরিক্ত পণ্যের নোট এডিট করার ফাংশন
        window.customerEditOrder = async function(orderId, oldAddress) {
            const newAddress = prompt("নতুন ডেলিভারি ঠিকানা বা অতিরিক্ত কোনো পণ্যের নোট লিখুন:", oldAddress);
            if (!newAddress || newAddress.trim() === "") return;

            const res = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${orderId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SB_KEY,
                    'Authorization': 'Bearer ' + SB_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ address: newAddress.trim() })
            });

            if (res.ok) {
                alert("আপনার অর্ডারের তথ্য সফলভাবে আপডেট হয়েছে! ✅");
                document.getElementById('my-orders-modal')?.remove();
            } else {
                alert("আপডেট করা যায়নি! Supabase-এ orders টেবিলের UPDATE পলিসি চালু আছে কি না দেখুন।");
            }
        };

        // কাস্টমারের অর্ডার বাতিল করার ফাংশন
        window.customerCancelOrder = async function(orderId) {
            if (!confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?")) return;

            const res = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${orderId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SB_KEY,
                    'Authorization': 'Bearer ' + SB_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Cancelled' })
            });

            if (res.ok) {
                alert("অর্ডারটি বাতিল করা হয়েছে! ❌");
                document.getElementById('my-orders-modal')?.remove();
            } else {
                alert("বাতিল করা যায়নি! Supabase-এ orders টেবিলের UPDATE পলিসি চেক করুন।");
            }
        };

        header.appendChild(btn);
    }
    // সব ফাংশন একসাথে চালু করা
    window.addEventListener('DOMContentLoaded', async () => {
        await applyShopSettings();
        await loadProductStatuses();
        setupCategoryFilters();
        setupMyOrdersButton();
        updateDeliveryUI();
        applyProductBadges();

        setInterval(() => {
            updateDeliveryUI();
            applyProductBadges();
        }, 900);
    });
})();
    // --- আপডেট ৩: প্রোডাক্ট কুইক-ভিউ পপ-আপ (ছবিতে ক্লিক করলে বড় ছবি ও বিস্তারিত) ---
    function setupProductQuickView() {
        const productGrid = document.querySelector('#product-list, .product-grid, .products-grid');
        if (!productGrid) return;

        Array.from(productGrid.children).forEach(card => {
            const img = card.querySelector('img');
            if (!img || img.dataset.quickViewBound) return;

            img.style.cursor = 'zoom-in';
            img.title = 'বিস্তারিত দেখতে ক্লিক করুন';
            img.dataset.quickViewBound = 'true';

            img.onclick = function() {
                const title = card.querySelector('h3, h4')?.innerText || 'পণ্যের বিবরণ';
                const desc = card.querySelector('p')?.innerText || 'তাজা ও মানসম্মত পণ্য।';
                const addBtn = card.querySelector('button');
                const isOutOfStock = addBtn && addBtn.disabled;

                // দাম বের করা
                const priceMatch = card.innerText.match(/৳\s*\d+/g);
                const priceText = priceMatch ? priceMatch[priceMatch.length - 1] : '';

                const modal = document.createElement('div');
                modal.id = 'product-quickview-modal';
                modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center; z-index:9999; padding:15px;';

                modal.innerHTML = `
                    <div style="background:#fff; max-width:380px; width:100%; padding:20px; border-radius:12px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.25); position:relative;">
                        <button type="button" onclick="document.getElementById('product-quickview-modal').remove()" style="position:absolute; top:10px; right:12px; background:#f3f4f6; border:none; width:30px; height:30px; border-radius:50%; font-size:16px; cursor:pointer; font-weight:bold;">✕</button>
                        <img src="${img.src}" style="width:100%; max-height:240px; object-fit:contain; border-radius:8px; margin-bottom:12px; background:#f9fafb; padding:5px;">
                        <h3 style="margin:0 0 6px 0; color:#1f2937; font-size:20px;">${title}</h3>
                        <p style="margin:0 0 12px 0; color:#6b7280; font-size:14px; line-height:1.5;">${desc}</p>
                        <div style="font-size:22px; font-weight:bold; color:#16a34a; margin-bottom:15px;">${priceText}</div>
                        <button type="button" id="qv-add-btn" ${isOutOfStock ? 'disabled' : ''} style="width:100%; background:${isOutOfStock ? '#dc2626' : '#16a34a'}; color:#fff; border:none; padding:12px; border-radius:6px; font-size:16px; font-weight:bold; cursor:${isOutOfStock ? 'not-allowed' : 'pointer'};">
                            ${isOutOfStock ? '❌ স্টক শেষ' : '🛒 কার্টে যোগ করুন'}
                        </button>
                    </div>
                `;

                document.body.appendChild(modal);

                // পপ-আপের বাটনে ক্লিক করলে মূল কার্ডের বাটনে ক্লিক হবে
                const qvBtn = document.getElementById('qv-add-btn');
                if (qvBtn && !isOutOfStock && addBtn) {
                    qvBtn.onclick = function() {
                        addBtn.click();
                        modal.remove();
                    };
                }

                // পপ-আপের বাইরে ক্লিক করলে বন্ধ হবে
                modal.onclick = function(e) {
                    if (e.target === modal) modal.remove();
                };
            };
        });
    }

    // নিচের setInterval-এর ভেতরে setupProductQuickView() চালু রাখা
    setInterval(setupProductQuickView, 1000);
    // --- আপডেট ৪, ৫ ও ৬: লাইভ স্ট্যাটাস, ডার্ক মোড ও Back-to-Top বাটন ---
    function setupExtraEnhancements() {
        const header = document.querySelector('header');
        if (!header) return;

        // ১. দোকানের খোলা/বন্ধ লাইভ স্ট্যাটাস (বাংলাদেশ সময় অনুযায়ী সকাল ৮টা - রাত ১০টা)
        if (!document.getElementById('shop-live-status')) {
            const bdTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
            const hour = bdTime.getHours();
            const isOpen = hour >= 8 && hour < 22;

            const statusBadge = document.createElement('div');
            statusBadge.id = 'shop-live-status';
            statusBadge.style.cssText = 'display: inline-block; margin-top: 8px; margin-left: 8px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: rgba(0,0,0,0.25); color: #fff;';
            statusBadge.innerHTML = isOpen 
                ? '🟢 দোকান এখন খোলা (দ্রুত ডেলিভারি চলছে)' 
                : '🔴 এখন বন্ধ (সকাল ৮টায় ডেলিভারি শুরু)';
            header.appendChild(statusBadge);
        }

        // ২. ডার্ক মোড বাটন (🌙)
        if (!document.getElementById('dark-mode-toggle')) {
            const darkStyle = document.createElement('style');
                      darkStyle.innerHTML = `
                body.dark-theme { background-color: #121212 !important; color: #e5e7eb !important; }
                body.dark-theme main > div > div, body.dark-theme .cart-container, body.dark-theme .cart-box,
                body.dark-theme #cart-section, body.dark-theme aside, body.dark-theme div[style*="background"],
                body.dark-theme #product-list > div, body.dark-theme .product-grid > div, body.dark-theme .products-grid > div {
                    background-color: #1e1e1e !important; color: #f3f4f6 !important; border-color: #333 !important;
                }
                body.dark-theme h2, body.dark-theme h3, body.dark-theme label, body.dark-theme p, body.dark-theme span {
                    color: #f3f4f6 !important;
                }
                body.dark-theme input, body.dark-theme textarea {
                    background-color: #2a2a2a !important; color: #ffffff !important; border-color: #555 !important;
                }
                body.dark-theme #delivery-charge-info {
                    background-color: #143322 !important; color: #86efac !important;
                }
            `;
            document.head.appendChild(darkStyle);

            const darkBtn = document.createElement('button');
            darkBtn.type = 'button';
            darkBtn.id = 'dark-mode-toggle';
            darkBtn.innerHTML = '🌙 ডার্ক মোড';
            darkBtn.style.cssText = 'margin-top: 8px; margin-left: 8px; background: #1f2937; color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer;';

            darkBtn.onclick = function() {
                document.body.classList.toggle('dark-theme');
                const isDark = document.body.classList.contains('dark-theme');
                darkBtn.innerHTML = isDark ? '☀️ লাইট মোড' : '🌙 ডার্ক মোড';
                darkBtn.style.background = isDark ? '#f59e0b' : '#1f2937';
                darkBtn.style.color = isDark ? '#000' : '#fff';
            };
            header.appendChild(darkBtn);
        }

        // ৩. উপরে ওঠার বাটন (⬆️ Back to Top)
        if (!document.getElementById('back-to-top-btn')) {
            const topBtn = document.createElement('button');
            topBtn.type = 'button';
            topBtn.id = 'back-to-top-btn';
            topBtn.innerHTML = '⬆️';
            topBtn.title = 'উপরে যান';
            topBtn.style.cssText = 'display: none; position: fixed; bottom: 25px; right: 25px; width: 45px; height: 45px; border-radius: 50%; background: #16a34a; color: white; border: none; font-size: 20px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 999;';

            topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.appendChild(topBtn);

            window.addEventListener('scroll', () => {
                topBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
            });
        }
    }

    window.addEventListener('DOMContentLoaded', setupExtraEnhancements);
    // --- মাসব্যাপী / সাপ্তাহিক অফার প্রোমো কার্ড, কাউন্টডাউন টাইমার ও অফার ফিল্টার ---
    async function setupPromoOfferSection() {
        const heading = Array.from(document.querySelectorAll('h2, h3')).find(el => el.innerText.includes('আমাদের পণ্যসমূহ'));
        if (!heading || document.getElementById('promo-offer-card')) return;

        // ডাটাবেজ থেকে অফার ব্যানারের লেখা আনা
        let offerHeadline = '🔥 মাসব্যাপী ধামাকা অফার! নির্বাচিত পণ্যে ১০% - ২০% পর্যন্ত বিশেষ ছাড়!';
        let offerSubtext = 'সীমিত সময়ের জন্য! আজই আপনার পছন্দের বাজার অর্ডার করুন।';

        try {
            const res = await fetch(SB_URL + '/rest/v1/shop_settings?select=*', {
                headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const dbText = data[0].banner_text || data[0].offer_text || '';
                if (dbText && dbText.trim() !== '' && dbText.trim().toLowerCase() !== 'khan super shop') {
                    offerHeadline = '🔥 ' + dbText.trim();
                }
            }
        } catch (e) {}

        // ১. আকর্ষণীয় অফার প্রোমো কার্ড তৈরি
        const promoCard = document.createElement('div');
        promoCard.id = 'promo-offer-card';
        promoCard.style.cssText = 'background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #fff; padding: 16px 20px; border-radius: 10px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);';

        promoCard.innerHTML = `
            <div style="flex: 1; min-width: 220px;">
                <div style="display: inline-block; background: #facc15; color: #000; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 20px; margin-bottom: 6px;">✨ স্পেশাল ক্যাম্পেইন • ১০% - ২০% ছাড়</div>
                <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #fff !important;">${offerHeadline}</h3>
                <p style="margin: 0; font-size: 13px; color: #fee2e2 !important;">${offerSubtext}</p>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 8px; text-align: center; min-width: 150px;">
                <div style="font-size: 11px; color: #fde047; margin-bottom: 4px;">⏳ অফার শেষ হতে বাকি:</div>
                <div id="offer-countdown-timer" style="font-size: 16px; font-weight: bold; letter-spacing: 1px; color: #fff;">00h : 00m : 00s
            </div>
        `;

        heading.insertAdjacentElement('beforebegin', promoCard);

        // ২. লাইভ কাউন্টডাউন টাইমার (প্রতিদিন রাত ১২টা পর্যন্ত রিসেট হবে)
        function updateCountdown() {
            const timerEl = document.getElementById('offer-countdown-timer');
            if (!timerEl) return;
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(23, 59, 59, 999);
            const diff = midnight - now;

            const hrs = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            const mins = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
            const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
            timerEl.innerText = `${hrs}h : ${mins}m : ${secs}s`;
        }
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // ৩. ক্যাটাগরি বারে "🔥 ১০%-২০% ছাড়" ফিল্টার বাটন যুক্ত করা
        const catBar = document.getElementById('smart-category-bar');
        if (catBar && !document.getElementById('offer-filter-btn')) {
            const offerBtn = document.createElement('button');
            offerBtn.type = 'button';
            offerBtn.id = 'offer-filter-btn';
            offerBtn.innerText = '🔥 ১০%-২০% ছাড়';
            offerBtn.style.cssText = 'background: #fef2f2; color: #dc2626; border: 1px solid #dc2626; padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer;';

            offerBtn.onclick = function() {
                catBar.querySelectorAll('button').forEach(b => {
                    b.style.background = '#fff'; b.style.color = '#333'; b.style.borderColor = '#ccc';
                });
                offerBtn.style.background = '#dc2626';
                offerBtn.style.color = '#fff';
                offerBtn.style.borderColor = '#dc2626';

                const productGrid = document.querySelector('#product-list, .product-grid, .products-grid');
                if (!productGrid) return;

                Array.from(productGrid.children).forEach(card => {
                    // যেসব পণ্যে কাটা দাম (<del>) আছে, শুধু সেগুলো দেখাবে
                    const hasDiscount = card.querySelector('del') !== null || card.dataset.discountApplied === 'true';
                    card.style.display = hasDiscount ? '' : 'none';
                });
            };
            catBar.appendChild(offerBtn);
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupPromoOfferSection, 800);
    });
