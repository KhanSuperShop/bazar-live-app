Load Supabase CDN Script safely
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://jsdelivr.net
document.head.appendChild(supabaseScript);

const SUPABASE_URL = "https://atihyfukytqfvlzkwkpa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE"; 

let supabase;

supabaseScript.onload = () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check if it is Admin Page
    if (document.getElementById('addProductForm')) {
        setupAdminInterception();
    }
    
    // Check if it is Customer/Index Page
    if (window.location.href.includes('index.html') || (!document.getElementById('addProductForm') && document.querySelector('.card'))) {
        initCustomerPage();
    }
};

// 3. Admin Page Logic
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

// 4. Customer Page Logic
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
