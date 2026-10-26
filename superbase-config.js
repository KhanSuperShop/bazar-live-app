// ১. সুপাবেস সিডিএন স্ক্রিপ্ট লোড করা
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://jsdelivr.net';
document.head.appendChild(supabaseScript);

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE"; 

let supabase;

supabaseScript.onload = () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // এডমিন পেজ হলে সুপাবেস কানেক্ট করা
    if (document.getElementById('addProductForm')) {
        setupAdminInterception();
    }
    
    // কাস্টমার পেজ (index.html) হলে প্রোডাক্ট লোড করা
    if (document.querySelector('.admin-grid') && !document.getElementById('addProductForm')) {
        initCustomerPage();
    }
};

// ৩. এডমিন পেজের জন্য নিখুঁত ব্যাকগ্রাউন্ড কানেকশন (মূল কোডে কোনো পরিবর্তন ছাড়াই)
function setupAdminInterception() {
    const form = document.getElementById('addProductForm');
    
    // সুপাবেস থেকে ডাটা এনে টেবিলে দেখানোর জন্য আপনার টেবিলকে ব্যাকগ্রাউন্ডে রিফ্রেশ করা
    syncTableWithSupabase();

    form.addEventListener('submit', async () => {
        // আপনার মূল HTML এর ইনপুট আইডি থেকে মান নেওয়া
        const pname = document.getElementById('pname').value;
        const price = document.getElementById('price').value;
        const pimg = document.getElementById('pimg').value;

        if(!pname || !price) return;

        // ব্যাকগ্রাউন্ডে সুপাবেস ডাটাবেজে প্রোডাক্ট পাঠিয়ে দেওয়া
        await supabase
            .from('products')
            .insert([{ 
                name: pname, 
                price: parseFloat(price), 
                image_url: pimg || 'https://placeholder.com'
            }]);
            
        // টেবিলটি আপডেট করা
        setTimeout(syncTableWithSupabase, 800);
    });
}

// সুপাবেস থেকে ডাটা এনে টেবিলে সিঙ্ক করার ফাংশন
async function syncTableWithSupabase() {
    const tableBody = document.getElementById('adminProductTable');
    if (!tableBody) return;

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (!error && products && products.length > 0) {
        tableBody.innerHTML = '';
        products.forEach(prod => {
            const row = `<tr>
                <td><img src="${prod.image_url}" width="50" style="border-radius:5px; object-fit:cover;"></td>
                <td>${prod.name}</td>
                <td>${prod.price} টাকা</td>
                <td><button onclick="deleteSupabaseProduct(${prod.id})" style="background:#dc3545; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">মুছুন</button></td>
            </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }
}

// সুপাবেস থেকে প্রোডাক্ট ডিলিট করার গ্লোবাল ফাংশন
window.deleteSupabaseProduct = async (id) => {
    if (confirm('আপনি কি পণ্যটি ডাটাবেজ থেকে মুছে ফেলতে চান?')) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            syncTableWithSupabase();
        }
    }
};

// ৪. কাস্টমার পেজের লজিক (index.html-এ প্রোডাক্ট দেখানো)
async function initCustomerPage() {
    const gridContainer = document.querySelector('.admin-grid'); 
    if (!gridContainer) return;
    
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (!error && products) {
        // গিটহাবের স্ট্যাটিক ডেমো প্রোডাক্টগুলো সরাতে চাইলে নিচের লাইনটি আনকমেন্ট করতে পারেন
        // gridContainer.innerHTML = ''; 
        
        products.forEach(prod => {
            const card = `<div class="card" style="margin: 10px; display: inline-block; vertical-align: top;">
                <div style="text-align:center;">
                    <img src="${prod.image_url}" width="120" height="120" style="object-fit:cover; border-radius:8px;">
                </div>
                <h3>${prod.name}</h3>
                <p>${prod.price} টাকা</p>
                <button class="btn-submit" style="width:100%;">কার্টে যোগ করুন</button>
            </div>`;
            gridContainer.insertAdjacentHTML('afterbegin', card);
        });
    }
}
