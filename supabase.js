// ১. আপনার গুগল অ্যাপস স্ক্রিপ্ট এর ওয়েব অ্যাপ URL টি এখানে দিন
const sheetAPI = "https://script.google.com/macros/s/AKfycbyHhmgrGcexZRDZ6Au70QqoDtM9m5jiAldLvjKpwj29J3BJNhHft1dBPWSNwoYO3Dx8/exec"; 

// ২. গুগল শিট থেকে ডেটা এনে ওয়েবসাইটে দেখানোর অটোমেটিক ফাংশন
async function loadGoogleSheetProducts() {
    try {
        const response = await fetch(sheetAPI);
        const products = await response.json();
        
        // ইনডেক্স পেজের মূল পণ্যের গ্রিডকে খুঁজে বের করা হচ্ছে
        const groceryGrid = document.getElementById('groceryGrid') || document.querySelector('.products-grid');
        const frozenGrid = document.getElementById('frozenGrid');
        
        // আগের স্ট্যাটিক প্রোডাক্টগুলো থাকলে তা পরিষ্কার করা হচ্ছে
        if (groceryGrid) groceryGrid.innerHTML = '';
        if (frozenGrid) frozenGrid.innerHTML = '';
        
        products.forEach(product => {
            const cardHTML = `
                <div class="product-card">
                    <img src="${product.image || 'https://flaticon.com'}" alt="${product.name}">
                    <div>
                        <div class="product-title">${product.name}</div>
                        <div class="product-price">${product.price} টাকা</div>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.name}', ${product.price})">কার্টে যোগ করুন</button>
                </div>
            `;

            // ক্যাটাগরি অনুযায়ী অটোমেটিক পণ্য সাজানো হচ্ছে
            if (product.category === 'frozen' && frozenGrid) {
                frozenGrid.innerHTML += cardHTML;
            } else if (groceryGrid) {
                groceryGrid.innerHTML += cardHTML;
            }
        });

    } catch (error) {
        console.error("গুগল শিট লোড হতে সমস্যা হয়েছে: ", error);
    }
}

// ইনডেক্স পেজ ওপেন হওয়ার সাথে সাথে এই পুরো কোডটি স্বয়ংক্রিয়ভাবে সচল হবে
window.addEventListener('DOMContentLoaded', loadGoogleSheetProducts);
