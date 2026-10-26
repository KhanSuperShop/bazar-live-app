// ১. সুপাবেস সিডিএন স্ক্রিপ্ট লোড করা
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://jsdelivr.net';
document.head.appendChild(supabaseScript);

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE"; 

let supabase;

supabaseScript.onload = () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // এডমিন পেজ হলে ব্যাকগ্রাউন্ড কানেকশন চালু করা
    if (document.getElementById('addProductForm')) {
        setupAdminInterception();
    }
    
    // কাস্টমার পেজ (index.html) হলে প্রোডাক্ট লোড করা
    if (window.location.href.includes('index.html') || (!document.getElementById('addProductForm') && document.querySelector('.card'))) {
        initCustomerPage();
    }
};

// ৩. এডমিন পেজের লজিক
function setupAdminInterception() {
    const form = document.getElementById('addProductForm');
    syncTableWithSupabase();

    form.addEventListener('submit', async () => {
        const pname = document.getElementById('pname').value;
        const price = document.getElementById('price').value;
        const pimg = document.getElementById('pimg').value;

        if(!pname || !price) return;

        await supabase
            .from('products')
            .insert([{ 
                name: pname, 
                price: parseFloat(price), 
                image_url: pimg || 'https://placeholder.com'
            }]);
            
        setTimeout(syncTableWithSupabase, 800);
    });
}

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

window.deleteSupabaseProduct = async (id) => {
    if (confirm('আপনি কি পণ্যটি ডাটাবেজ থেকে মুছে ফেলতে চান?')) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            syncTableWithSupabase();
        }
    }
};

// ৪. কাস্টমার পেজের লজিক (সবচেয়ে নিরাপদ উপায়ে পণ্য যুক্ত করা)
async function initCustomerPage() {
    // যেকোনো একটি কার্ডের প্যারেন্ট বা মেইন কন্টেইনার খুঁজে বের করা
    const sampleCard = document.querySelector('.card');
    if (!sampleCard) return;
    
    const gridContainer = sampleCard.parentElement; 
    if (!gridContainer) return;
    
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (!error && products) {
        products.forEach(prod => {
            // আপনার মেইন ইনডেক্স পেজের কার্ডের এইচটিএমএল ডিজাইনের সাথে মিল রেখে তৈরি
            const card = `<div class="card">
                <div style="text-align:center;">
                    <img src="${prod.image_url}" width="120" height="120" style="object-fit:cover; border-radius:8px;">
                </div>
                <h3>${prod.name}</h3>
                <p>${prod.price} টাকা</p>
                <button class="btn-submit" style="width:100%;">কার্টে যোগ করুন</button>
            </div>`;
            // ডেমো প্রোডাক্টগুলোর সবার প্রথমে নতুন রিয়েল প্রোডাক্ট যুক্ত হবে
            gridContainer.insertAdjacentHTML('afterbegin', card);
        });
    }
}
