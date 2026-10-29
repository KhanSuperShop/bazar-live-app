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
