// ১. সুপাবেস কানেকশন কনফিগারেশন
const SUPABASE_URL = "https://atihyfukytqfvlzkwkpa.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE"; 

// ২. সুপাবেস ক্লায়েন্ট তৈরি
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase connected with KhanSuperShop!");

// ৩. সুপাবেস থেকে ডাটা তুলে এনে কাস্টমার পেজে দেখানোর ফাংশন
async function fetchProductsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error("সুপাবেস থেকে পণ্য আনতে সমস্যা:", error.message);
            return [];
        }
        return data; 
    } catch (err) {
        console.error("ত্রুটি:", err);
        return [];
    }
}

// ৪. অ্যাডমিন পেজ থেকে পণ্য সুপাবেসে সেভ করার ফাংশন
async function saveProductToSupabase(name, price, imageUrl) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name: name, price: parseFloat(price), image_url: imageUrl }]);

        if (error) {
            console.error("সুপাবেসে পণ্য সেভ করতে সমস্যা:", error.message);
        } else {
            console.log("পণ্যটি সফলভাবে সুpabase-এ সেভ হয়েছে!");
            alert("পণ্যটি সফলভাবে যুক্ত হয়েছে!");
            location.reload(); 
        }
    } catch (err) {
        console.error("ত্রুটি:", err);
    }
}
