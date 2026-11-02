// ১. সুপাবেস কানেকশন সেটআপ
const SUPABASE_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const container = document.getElementById('product-container');

// ২. ডাটাবেজ থেকে প্রোডাক্ট নিয়ে আসার ফাংশন
async function LoadProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        container.innerHTML = `<p class="loading" style="color: red;">প্রোডাক্ট লোড করা যায়নি: ${error.message}</p>`;
        return;
    }

    if (!products || products.length === 0) {
        container.innerHTML = `<p class="loading">বর্তমানে কোনো প্রোডাক্ট নেই।</p>`;
        return;
    }

    container.innerHTML = "";
    
    products.forEach(product => {
        // সিঙ্গেল কোট বা স্ট্রিংয়ের এরর এড়াতে title কে সুন্দরভাবে পাস করা হয়েছে
        const safeTitle = product.title.replace(/'/g, "\\'");
        
        let productHtml = `
            <div class="product-card">
                <img src="${product.image_url || 'https://placeholder.com'}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description || '(কোনো বিবরণ নেই)'}</p>
                <div class="price">৳${product.price}</div>
                <!-- বাটনটিতে সঠিক ফাংশন ও ডাটা যুক্ত করা হয়েছে -->
                <button onclick="addToCart('${safeTitle}', ${product.price})">কার্টে যোগ করুন</button>
            </div>
        `;
        container.innerHTML += productHtml;
    });
}

// পেজ লোড হলে প্রোডাক্ট দেখাবে
window.onload = LoadProducts;

// ৩. কার্ট (Cart) ম্যানেজমেন্ট স্টেট ও ফাংশনসমূহ
let cart = [];
let totalPrice = 0;

// কার্টে নতুন পণ্য যোগ করার ফাংশন
function addToCart(productTitle, price) {
    // কার্টে এই পণ্যটি আগে থেকেই আছে কিনা চেক করা
    const existingItem = cart.find(item => item.title === productTitle);
    
    if (existingItem) {
        existingItem.quantity += 1; // থাকলে ১টি বাড়িয়ে দাও
    } else {
        // না থাকলে নতুন অবজেক্ট হিসেবে যোগ করো
        cart.push({ title: productTitle, price: Number(price), quantity: 1 });
    }
    
    updateCartUI();
}

// প্লাস বাটন চাপলে পরিমাণ বাড়ানো
function increaseQuantity(productTitle) {
    const item = cart.find(item => item.title === productTitle);
    if (item) {
        item.quantity += 1;
        updateCartUI();
    }
}

// মাইনাস বাটন চাপলে পরিমাণ কমানো
function decreaseQuantity(productTitle) {
    const item = cart.find(item => item.title === productTitle);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(productTitle); // ০ হয়ে গেলে কার্ট থেকে মুছে ফেলবে
            return;
        }
        updateCartUI();
    }
}

// কার্ট থেকে পণ্য সম্পূর্ণ ডিলিট করা (X বাটন)
function removeFromCart(productTitle) {
    cart = cart.filter(item => item.title !== productTitle);
    updateCartUI();
}

// কার্টের ইন্টারফেস (UI) রিফ্রেশ ও মোট দাম হিসাব করার মেইন ফাংশন
function updateCartUI() {
    const cartStatus = document.getElementById('cart-status');
    const totalPriceSpan = document.getElementById('total-price');
    
    // হেডার বা টপ-বারে যদি কোনো শর্টকাট কার্ট কাউন্টার থাকে (যেমন ছবিতে কালো বৃত্তে '৩' লেখা)
    const topCartBadges = document.querySelectorAll('.cart-count, #cart-badge');
    
    // কার্টের মোট আইটেম সংখ্যা হিসাব
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    topCartBadges.forEach(badge => badge.innerText = totalItems);

    if (cart.length === 0) {
        cartStatus.innerHTML = `আপনার থলি খালি আছে। পণ্য যোগ করুন।`;
        totalPriceSpan.innerText = "০";
        return;
    }

    // শেষ ছবির মতো প্লাস, মাইনাস ও দাম সহ প্রতিটা পণ্যের নতুন লেআউট তৈরি
    let cartHtml = `<div class="cart-items-list">`;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const safeTitle = item.title.replace(/'/g, "\\'");
        
        cartHtml += `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 5px 0; border-bottom: 1px dashed #eee;">
                <span class="item-name" style="flex: 2;">${item.title}</span>
                
                <div class="quantity-controls" style="flex: 2; display: flex; align-items: center; gap: 5px;">
                    <button type="button" onclick="decreaseQuantity('${safeTitle}')" style="background-color: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-weight: bold; min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button type="button" onclick="increaseQuantity('${safeTitle}')" style="background-color: #28a745; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                </div>
                
                <span class="item-total-price" style="flex: 2; text-align: right; font-weight: bold;">${itemTotal} টাকা</span>
                
                <button type="button" onclick="removeFromCart('${safeTitle}')" style="background: none; border: none; color: #dc3545; font-weight: bold; cursor: pointer; margin-left: 10px; flex: 0.5; text-align: right;">X</button>
            </div>
        `;
    });
    
    cartHtml += `</div>`;
    cartStatus.innerHTML = cartHtml;

    // সর্বমোট মূল্য হিসাব
    totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPriceSpan.innerText = totalPrice;
}

// ৪. ফর্ম সাবমিট করে সুপা-বেসে অর্ডার পাঠানো
document.getElementById('delivery-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
        alert("আপনার কার্ট খালি! দয়া করে পণ্য যোগ করুন।");
        return;
    }

    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const address = document.getElementById('user-address').value;

    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    customer_name: name,
                    phone_number: phone,
                    delivery_address: address,
                    total_amount: totalPrice,
                    items: cart // প্লাস-মাইনাস সহ সম্পূর্ণ কার্টের জেসন (JSON) ডাটা চলে যাবে
                }
            ]);

        if (error) throw error;

        alert("আপনার অর্ডারটি সফলভাবে সুপা-বেসে জমা হয়েছে!");
        
        // সফল হওয়ার পর কার্ট ক্লিয়ার ও ফর্ম রিসেট
        cart = [];
        document.getElementById('delivery-form').reset();
        updateCartUI();

    } catch (error) {
        console.error(error);
        alert(`অর্ডার পাঠানো যায়নি: ${error.message}`);
    }
});
