(function() {
    const SUPABASE_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
    const SUPABASE_ANON_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI';
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

                if (outOfStockTitles.some(title => cardText.includes(title))) {
                    btn.disabled = true;
                    btn.innerText = '❌ স্টক শেষ';
                    btn.style.backgroundColor = '#dc2626';
                    btn.style.cursor = 'not-allowed';
                }

                if (!card.dataset.discountApplied) {
                    for (const [title, info] of Object.entries(discountProductsMap)) {
                        if (cardText.includes(title)) {
                            card.innerHTML = card.innerHTML.replace(
                                `৳${info.price}`,
                                `<del style="color:#888; font-size:13px; margin-right:5px;">৳${info.old_price}</del><span style="color:#dc2626; font-weight:bold;">৳${info.price}</span>`
                            );
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

    // ৬. কাস্টমারের জন্য "📋 আমার অর্ডার" বাটন
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

                const modal = document.createElement('div');
                modal.id = 'my-orders-modal';
                modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; padding:15px;';

                const ordersHtml = orders.reverse().map(o => {
                    const date = o.created_at ? new Date(o.created_at).toLocaleDateString('bn-BD') : '';
                    const items = Array.isArray(o.items) ? o.items.map(i => `${i.title} (${i.quantity}টি)`).join(', ') : '';
                    return `
                        <div style="background:#f9fafb; border:1px solid #ddd; border-left:4px solid #16a34a; padding:10px; border-radius:6px; margin-bottom:10px; text-align:left; font-size:13px;">
                            <div style="display:flex; justify-content:space-between; font-weight:bold; color:#333;">
                                <span>অর্ডার #${o.id}</span>
                                <span style="color:#666;">${date}</span>
                            </div>
                            <div style="margin:5px 0; color:#16a34a;">${items}</div>
                            <div style="font-weight:bold; color:#dc2626;">মোট বিল: ৳${o.total_amount} টাকা</div>
                        </div>
                    `;
                }).join('');

                modal.innerHTML = `
                    <div style="background:#fff; max-width:420px; width:100%; max-height:80vh; overflow-y:auto; padding:20px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                        <h3 style="margin-top:0; color:#16a34a; border-bottom:2px solid #16a34a; padding-bottom:8px;">📋 আপনার পূর্ববর্তী অর্ডারসমূহ</h3>
                        ${ordersHtml}
                        <button type="button" onclick="document.getElementById('my-orders-modal').remove()" style="width:100%; background:#dc2626; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">বন্ধ করুন</button>
                    </div>
                `;
                document.body.appendChild(modal);
            } catch (e) {
                alert("অর্ডার লোড করতে সমস্যা হয়েছে!");
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
