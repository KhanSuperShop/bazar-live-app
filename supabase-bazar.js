// ১. সুপাবেস কানেকশন সেটআপ
const SUPABASE_URL = "https://atihyfukytqfvlzkwkpa.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE"; // আপনার আসল অ্যানন কি এখানে বসান
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = []; 
let allProducts = []; 

// ২. ডাটাবেস থেকে পণ্য লোড করা
async function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">পণ্য লোড হচ্ছে...</p>';

    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error("ডাটা আনতে সমস্যা হয়েছে:", error.message);
        productGrid.innerHTML = `<p style="grid-column: 1/-1; color:red; text-align:center;">পণ্য লোড করা যায়নি!</p>`;
        return;
    }

    allProducts = products; 
    productGrid.innerHTML = ''; 

    if(products.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">কোনো পণ্য পাওয়া যায়নি।</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image_url || 'https://placeholder.com'}" alt="${product.name}">
            <div class="product-title">${product.name}</div>
            <div class="product-price">${product.price} টাকা</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">কার্টে যোগ করুন</button>
        `;
        productGrid.appendChild(card);
    });
}

// ৩. কার্ট ফাংশনালিটি (গ্লোবাল উইন্ডো স্কোপে রাখা হলো)
window.addToCart = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const cartTotalAmount = document.getElementById('cartTotalAmount');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">আপনার থলি খালি আছে। পণ্য যোগ করুন।</p>';
        cartCount.innerText = '০';
        cartTotalAmount.innerText = '০';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalCount = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalCount += item.quantity;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div><strong>${item.name}</strong> (x${item.quantity})</div>
            <div>
                <span>${item.price * item.quantity} টাকা</span>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">❌</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    cartCount.innerText = totalCount;
    cartTotalAmount.innerText = total;
}

// ৪. অর্ডার সাবমিট (WhatsApp ফর্ম)
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (cart.length === 0) {
                alert("আপনার কার্ট খালি! দয়া করে পণ্য যোগ করুন।");
                return;
            }

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const totalAmount = document.getElementById('cartTotalAmount').innerText;

            let orderDetails = `*নতুন অর্ডার - খান সুপার শপ*\n\n`;
            orderDetails += `*কাস্টমারের নাম:* ${name}\n`;
            orderDetails += `*মোবাইল নাম্বার:* ${phone}\n`;
            orderDetails += `*ঠিকানা:* ${address}\n\n`;
            orderDetails += `*পণ্যের তালিকা:*\n`;

            cart.forEach((item, index) => {
                orderDetails += `${index + 1}. ${item.name} - (মূল্য: ${item.price} টাকা) x ${item.quantity} = ${item.price * item.quantity} টাকা\n`;
            });

            orderDetails += `\n*সর্বমোট বিল:* ${totalAmount} টাকা`;

            const whatsappNumber = "8801700000000"; // আপনার আসল নাম্বার এখানে বসাবেন
            const whatsappUrl = `https://wa.me{whatsappNumber}?text=${encodeURIComponent(orderDetails)}`;

            window.open(whatsappUrl, '_blank');
            
            cart = [];
            updateCartUI();
            orderForm.reset();
        });
    }
});
// ১. সুপাবেস কানেক্ট করা (আপনার দেওয়া ইউআরএল এবং কী অনুযায়ী)
const SUPABASE_URL = "https://atihyfukytqfvlzkwkpa.supabase.co";
const SUPABASE_KEY = "sb_secret_A4el8vXIwiHGtos-nHGl9g_UonQ0uDJ"; // এখানে আপনার আসল ANON_KEY টি বসিয়ে দিন
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ২. ডেটাবেস থেকে পণ্য নিয়ে আসার মূল ফাংশন
async function fetchProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('সুপাবেস থেকে পণ্য আনতে সমস্যা হয়েছে:', error);
        return;
    }

    // আপনার ওয়েবসাইটের আসল মেইন কন্টেইনার ক্লাস হচ্ছে .products
    const productContainer = document.querySelector('.products'); 
    if (!productContainer) return;

    productContainer.innerHTML = ''; // আগের পুরোনো বা ডামি পণ্যগুলো সম্পূর্ণ মুছে ফেলা

    // ৩. লুপের মাধ্যমে সুpabase-এর পণ্যগুলো আপনার হুবহু ডিজাইনে বসানো
    products.forEach(product => {
        const productHTML = `
            <div class="product-item">
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${product.price} টাকা</p>
                <button onclick="addToCart('${product.name}', ${product.price})">কার্টে যোগ করুন</button>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });
}

// পেজ লোড হওয়ার সাথে সাথে সুপাবেস থেকে ৩০টি পণ্য স্ক্রিনে চলে আসবে
document.addEventListener('DOMContentLoaded', fetchProducts);
// ২. ডেটাবেস থেকে পণ্য নিয়ে আসার মূল ফাংশন
async function fetchProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('সুপাবেস থেকে পণ্য আনতে সমস্যা হয়েছে:', error);
        return;
    }

    // আপনার HTML-এর যে ডিভ (div) এর ভেতরে পণ্যগুলো থাকে সেটির আইডি (id)
    const productContainer = document.getElementById('product-list'); 
    if (!productContainer) return;

    productContainer.innerHTML = ''; // আগের ডামি পণ্যগুলো মুছে ফেলা

    // ৩. লুপের মাধ্যমে সুপাবেসের পণ্যগুলো আপনার ডিজাইনে বসানো
    products.forEach(product => {
        const productHTML = `
            <div class="product-item">
                <img src="${product.image_url}" alt="${product.name}" style="width:100%; max-width:150px; border-radius:8px;">
                <h3>${product.name}</h3>
                <p class="price">${product.price} টাকা</p>
                <!-- আপনার index.html-এর আসল addToCart ফাংশনটি এখানে কল হবে -->
                <button onclick="addToCart('${product.name}', ${product.price})">কার্টে যোগ করুন</button>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });
}

// পেজ লোড হওয়ার সাথে সাথে পণ্যগুলো চলে আসবে
document.addEventListener('DOMContentLoaded', fetchProducts);
