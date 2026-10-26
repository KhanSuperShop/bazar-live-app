import { createClient } from 'https://jsdelivr.net';
// ১. সুপাবেস ক্রেডেনশিয়াল (আপনার সঠিক প্রোজেক্ট লিঙ্ক ও কি)
const SUPABASE_URL = "https://atihyfukytqfvlzkwkpa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE"; 

let supabase;

// পেজ লোড হওয়ার সাথে সাথে সুপাবেস ক্লায়েন্ট চালু করা
window.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        supabase = .supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // এডমিন পেজ হলে ব্যাকগ্রাউন্ড কানেকশন চালু করা
        if (document.getElementById('addProductForm')) {
            setupAdminInterception();
        }
        
        // কাস্টমার পেজ (index.html) হলে প্রোডাক্ট লোড করা
        if (window.location.href.includes('index.html') || (!document.getElementById('addProductForm') && document.querySelector('.card'))) {
            initCustomerPage();
        }
    } else {
        console.error("Supabase CDN failed to load from HTML.");
    }
});

// ২. এডমিন পেজের ব্যাকগ্রাউন্ড লজিক (আপনার মূল কোড অপরিবর্তিত রেখে)
function setupAdminInterception() {
    const form = document.getElementById('addProductForm');
    syncTableWithSupabase();

    form.addEventListener('submit', async () => {
        const pname = document.getElementById('pname').value;
        const price = document.getElementById('price').value;
        const pimg = document.getElementById('pimg').value;

        if(!pname || !price) return;

        // সুপাবেস ডাটাবেজে প্রোডাক্ট পাঠানো
        await supabase
            .from('products')
            .insert([{ 
                name: pname, 
                price: parseFloat(price), 
                image_url: pimg || 'https://placeholder.com'
            }]);
            
        // টেবিল রিফ্রেশ করা
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

// ৩. কাস্টমার পেজের লজিক (index.html-এ প্রোডাক্ট কার্ড দেখানো)
async function initCustomerPage() {
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
