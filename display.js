// ১. সুপাবেস কানেকশন সেটআপ
const SUPABASE_URL = 'https://kuecacvhadqzywvkmauo.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI'; 

// সুপাবেস ক্লায়েন্ট ইনিশিয়েট করা (ডুপ্লিকেট এরর মুক্ত করা হয়েছে)
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ledBoard = document.getElementById('led-board');
const errorMsg = document.getElementById('error-msg');

// ২. সুপাবেস থেকে ডাটা নিয়ে এসে স্ক্রিনে দেখানোর মেইন ফাংশন
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('title, price')
            .order('title', { ascending: true });

        if (error) throw error;

        // পুরানো লিস্ট ক্লিয়ার করা
        ledBoard.innerHTML = '';

        if (data.length === 0) {
            ledBoard.innerHTML = '<div style="text-align:center;">কোনো পণ্য পাওয়া যায়নি</div>';
            return;
        }

        // নতুন ডাটা দিয়ে স্ক্রিন সাজানো
        data.forEach(product => {
            const row = document.createElement('div');
            row.className = 'product-row';
            row.innerHTML = `
                <span class="product-name">■ ${product.title}</span>
                <span class="product-price">৳ ${product.price}</span>
            `;
            ledBoard.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        errorMsg.innerText = "ডাটা লোড করতে সমস্যা হচ্ছে! RLS পলিসি বা কলামের নাম চেক করুন।";
    }
}

// ৩. রিয়েল-টাইম লিসেনার (ডাটাবেজে দাম চেঞ্জ হলেই এই ফাংশন অটো রান হবে)
function listenRealtime() {
    supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
                console.log('Change received!', payload);
                // ডাটাবেজে কোনো পরিবর্তন হলেই আবার নতুন করে ডাটা এনে ডিসপ্লে আপডেট করবে
                fetchProducts();
            }
        )
        .subscribe();
}

// ৪. পেজ ওপেন হওয়ার সাথে সাথে ফাংশনগুলো রান করা
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();   // প্রথমবার ডাটা লোড করার জন্য
    listenRealtime();  // রিয়েল-টাইম কানেকশন অন করার জন্য
});
