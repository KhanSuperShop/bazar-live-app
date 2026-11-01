// ১. সুপাবেস কানেকশন সেটআপ
const SUPABASE_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ২. ডাটাবেজ থেকে প্রোডাক্ট নিয়ে আসার ফাংশন
async function loadProducts() {
    const container = document.getElementById('product-container');

    // সুপাবেস এর 'products' টেবিল থেকে সব ডাটা রিড করা
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    // যদি কোনো সমস্যা বা এরর হয়
    if (error) {
        container.innerHTML = `<p class="loading" style="color: red;">প্রোডাক্ট লোড করা যায়নি: ${error.message}</p>`;
        return;
    }

    // যদি ডাটাবেজে কোনো প্রোডাক্ট না থাকে
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="loading">বর্তমানে কোনো প্রোডাক্ট নেই।</p>';
        return;
    }

    // কন্টেইনার খালি করা
    container.innerHTML = ''; 

    // লুপ চালিয়ে প্রতিটি প্রোডাক্টকে কার্ড আকারে এইচটিএমএল-এ যোগ করা
    products.forEach(product => {
        const productHtml = `
            <div class="product-card">
                <img src="${product.image_url && product.image_url.trim() !== '' ? product.image_url : 'https://unsplash.com'}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description || 'কোনো বিবরণ নেই।'}</p>
                <div class="price">৳${product.price}</div>
                <button>কার্টে যোগ করুন</button>
            </div>
        `;
        container.innerHTML += productHtml;
    });
}

// ৩. পেজটি লোড হলে ফাংশনটি চালু হবে
window.onload = loadProducts;
