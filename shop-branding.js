(function() {
    const SB_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
    const SB_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI';
    async function applyShopSettings() {
        try {
            const res = await fetch(SB_URL + '/rest/v1/shop_settings?select=*', {
                headers: {
                    'apikey': SB_KEY,
                    'Authorization': 'Bearer ' + SB_KEY
                }
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

            if (document.getElementById('shop-name')) document.getElementById('shop-name').innerText = shopName;
            if (document.getElementById('shop-phone')) document.getElementById('shop-phone').innerText = shopPhone;
            if (document.getElementById('shop-address')) document.getElementById('shop-address').innerText = shopAddress;
            if (document.getElementById('offer-banner-text')) document.getElementById('offer-banner-text').innerText = bannerText;

        } catch (err) {
            console.error('সেটিংস লোড হতে সমস্যা:', err);
        }
    }

    window.addEventListener('DOMContentLoaded', applyShopSettings);
})();
    // --- ফিচার ২: ডেলিভারি চার্জ ও ফ্রি ডেলিভারি অটো-ক্যালকুলেটর ---
    let shopDeliveryCharge = 50;
    let shopFreeLimit = 1000;

    async function loadDeliveryRules() {
        try {
            const res = await fetch(SB_URL + '/rest/v1/shop_settings?select=*', {
                headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                if (data[0].delivery_charge !== undefined) shopDeliveryCharge = Number(data[0].delivery_charge);
                if (data[0].free_delivery_limit !== undefined) shopFreeLimit = Number(data[0].free_delivery_limit);
            }
        } catch (e) {}
    }

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

    window.addEventListener('DOMContentLoaded', async () => {
        await loadDeliveryRules();
        updateDeliveryUI();
        setInterval(updateDeliveryUI, 800);
    });
    // --- ফিচার ৩: স্টক আউট (Out of Stock) অটো-কন্ট্রোল ---
    let outOfStockTitles = [];

    async function loadOutOfStockProducts() {
        try {
            const res = await fetch(SB_URL + '/rest/v1/products?select=title,in_stock', {
                headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                outOfStockTitles = data
                    .filter(p => p.in_stock === false)
                    .map(p => p.title.trim().toLowerCase());
            }
        } catch (e) {}
    }

    function applyOutOfStockBadges() {
        if (outOfStockTitles.length === 0) return;

        // পণ্যের কার্ডগুলো খুঁজে স্টক চেক করা
        document.querySelectorAll('button').forEach(btn => {
            if (btn.innerText.includes('কার্টে যোগ করুন')) {
                const card = btn.parentElement;
                const cardText = card ? card.innerText.toLowerCase() : '';
                const isOut = outOfStockTitles.some(title => cardText.includes(title));

                if (isOut) {
                    btn.disabled = true;
                    btn.innerText = '❌ স্টক শেষ';
                    btn.style.backgroundColor = '#dc2626';
                    btn.style.cursor = 'not-allowed';
                    btn.style.opacity = '0.85';
                }
            }
        });
    }

    window.addEventListener('DOMContentLoaded', async () => {
        await loadOutOfStockProducts();
        applyOutOfStockBadges();
        setInterval(applyOutOfStockBadges, 1000);
    });
    // --- ফিচার ৫: পণ্যের ডিসকাউন্ট বা আগের কাটা দাম দেখানো ---
    let discountProductsMap = {};

    async function loadDiscountPrices() {
        try {
            const res = await fetch(SB_URL + '/rest/v1/products?select=title,price,old_price', {
                headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                data.forEach(p => {
                    if (p.old_price && Number(p.old_price) > Number(p.price)) {
                        discountProductsMap[p.title.trim().toLowerCase()] = {
                            price: p.price,
                            old_price: p.old_price
                        };
                    }
                });
            }
        } catch (e) {}
    }

    function applyDiscountBadges() {
        if (Object.keys(discountProductsMap).length === 0) return;

        document.querySelectorAll('button').forEach(btn => {
            if (btn.innerText.includes('কার্টে যোগ করুন') || btn.innerText.includes('স্টক শেষ')) {
                const card = btn.parentElement;
                if (!card || card.dataset.discountApplied) return;

                const cardText = card.innerText.toLowerCase();
                for (const [title, info] of Object.entries(discountProductsMap)) {
                    if (cardText.includes(title)) {
                        card.innerHTML = card.innerHTML.replace(
                            `৳${info.price}`,
                            `<del style="color:#888; font-size:14px; margin-right:6px;">৳${info.old_price}</del><span style="color:#dc2626; font-weight:bold;">৳${info.price}</span> <span style="background:#fef2f2; color:#dc2626; font-size:11px; padding:2px 6px; border-radius:4px; border:1px solid #fecaca;">অফার!</span>`
                        );
                        card.dataset.discountApplied = 'true';
                        break;
                    }
                }
            }
        });
    }

    window.addEventListener('DOMContentLoaded', async () => {
        await loadDiscountPrices();
        applyDiscountBadges();
        setInterval(applyDiscountBadges, 1000);
    });
