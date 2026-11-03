// ১. সুপাবেস কানেকশন সেটআপ (আপনার প্রজেক্টের পুরোনো সুপাবেস অবজেক্ট ব্যবহার করা হচ্ছে)
const ledBoard = document.getElementById('led-board');
const errorMsg = document.getElementById('error-msg');

// ২. ডাটা নিয়ে এসে স্ক্রিনে দেখানোর মেইন ফাংশন (পুরানো ভার্সন অনুযায়ী ফিক্সড)
async function fetchProducts() {
    try {
        // সুপাবেস v1 এ ওল্ড স্টাইলে অর্ডার করতে হয়
        const { data, error } = await supabase
            .from('products')
            .select('title, price')
            .order('title', { ascending: true });

        if (error) throw error;

        // পুরানো লিস্ট ক্লিয়ার করা
        ledBoard.innerHTML = '';

        if (!data || data.length === 0) {
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

// ৩. রিয়েল-টাইম লিসেনার (পুরানো ভার্সন v1 স্টাইলে ফিক্সড)
function listenRealtime() {
    supabase
        .from('products')
        .on('*', payload => {
            console.log('Change received!', payload);
            fetchProducts(); // ডাটা চেঞ্জ হলেই স্ক্রিন আপডেট হবে
        })
        .subscribe();
}

// ৪. পেজ ওপেন হওয়ার সাথে সাথে ফাংশনগুলো রান করা
document.addEventListener('DOMContentLoaded', () => {
    // যদি মেইন পেজের supabase অবজেক্ট লোড হতে একটু সময় নেয়, তাই ছোট ১ সেকেন্ডের ডিলে
    setTimeout(() => {
        if (typeof supabase !== 'undefined') {
            fetchProducts();
            listenRealtime();
        } else {
            errorMsg.innerText = "সুপাবেস কানেকশন খুঁজে পাওয়া যাচ্ছে না!";
        }
    }, 1000);
});
