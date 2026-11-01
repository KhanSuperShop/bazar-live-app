// ১. সুপাবেস কানেকশন সেটআপ
const SUPABASE_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ২. লোকাল মেমোরি থেকে কার্ট ডাটা লোড করা
let cart = JSON.parse(localStorage.getItem('khan_shop_cart')) || [];

// ৩. ডাটাবেজ থেকে প্রোডাক্ট নিয়ে আসার ফাংশন
async function loadProducts() {
    const container = document.getElementById('product-container');
    
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        container.innerHTML = ''; // লোডিং টেক্সট মুছে ফেলা

        products.forEach(product => {
            // কার্টে এই প্রোডাক্টটি অলরেডি আছে কিনা এবং কয়টি আছে তা চেক করা
            const cartItem = cart.find(item => item.id === product.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // ডাটাবেজের সঠিক কলাম বা অবজেক্টের কী (Key) স্বয়ংক্রিয়ভাবে খুঁজে নেওয়ার ব্যবস্থা
            const pName = product.name || product.title || product.p_name || "পণ্য";
            const pDesc = product.description || product.desc || product.p_desc || "";
            const pImg = product.image_url || product.image || product.img_url || 'https://placeholder.com';
            const pPrice = product.price || product.p_price || 0;

            productCard.innerHTML = `
                <img src="${pImg}" alt="${pName}">
                <h3>${pName}</h3>
                <p class="description">${pDesc}</p>
                <p class="price">৳${pPrice}</p>
                
                <!-- বাটন কন্টেইনার -->
                <div class="cart-control-container" id="control-${product.id}">
                    ${quantity === 0 ? `
                        <button class="cart-btn" onclick="changeQuantity('${product.id}', '${pName}', ${pPrice}, 1)">কার্টে যোগ করুন</button>
                    ` : `
                        <div class="qty-picker">
                            <button class="qty-btn minus-btn" onclick="changeQuantity('${product.id}', '${pName}', ${pPrice}, -1)">-</button>
                            <span class="qty-number">${quantity}</span>
                            <button class="qty-btn plus-btn" onclick="changeQuantity('${product.id}', '${pName}', ${pPrice}, 1)">+</button>
                        </div>
                    `}
                </div>
            `;
            container.appendChild(productCard);
        });

    } catch (error) {
        container.innerHTML = `<p class="error">ডাটা লোড করতে সমস্যা হয়েছে: ${error.message}</p>`;
    }
}

// ৪. পণ্য কমাতে বা বাড়াতে এই মূল ফাংশনটি কাজ করবে
function changeQuantity(productId, productName, productPrice, change) {
    let cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    } else if (change > 0) {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    // লোকাল স্টোরেজে সেভ করা
    localStorage.setItem('khan_shop_cart', JSON.stringify(cart));
    
    // ইন্টারফেস সাথে সাথে আপডেট করা
    updateButtonUI(productId, productName, productPrice);
}

// ৫. বাটন পরিবর্তন করার ফাংশন (ক্লিক করলেই প্লাস-মাইনাস আসবে, ০ হলে আবার মূল বাটন আসবে)
function updateButtonUI(productId, productName, productPrice) {
    const controlContainer = document.getElementById(`control-${productId}`);
    const cartItem = cart.find(item => item.id === productId);
    const quantity = cartItem ? cartItem.quantity : 0;

    if (quantity === 0) {
        controlContainer.innerHTML = `
            <button class="cart-btn" onclick="changeQuantity('${productId}', '${productName}', ${productPrice}, 1)">কার্টে যোগ করুন</button>
        `;
    } else {
        controlContainer.innerHTML = `
            <div class="qty-picker">
                <button class="qty-btn minus-btn" onclick="changeQuantity('${productId}', '${productName}', ${productPrice}, -1)">-</button>
                <span class="qty-number">${quantity}</span>
                <button class="qty-btn plus-btn" onclick="changeQuantity('${productId}', '${productName}', ${productPrice}, 1)">+</button>
            </div>
        `;
    }
}

// পেজ লোড হলে রান হবে
window.onload = loadProducts;
