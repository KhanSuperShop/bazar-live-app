// ১. সুপাবেস কানেকশন কনফিগারেশন
const SUPABASE_URL = "https://atihyfukytqfvlzkwkpa.supabase.co"; // আপনার সুপাবেস URL দিন
const SUPABASE_ANON_KEY = "sb_publishable_7U9jd7NsYONos-EKa05NJg_CTl4-4ZE";             // আপনার সুপাবেস অ্যানন কি দিন

// ২. সুপাবেস ক্লায়েন্ট ইনিশিয়ালাইজ করা
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ৩. সফলভাবে কানেক্ট হয়েছে কিনা তা চেক করার জন্য
console.log("Supabase connected with KhanSuperShop Bazar App!");

// ৪. আপনার সুপাবেসের বাকি সব নতুন কোড (ডাটা সেভ/লগইন) এই ফাইলের নিচেই লিখবেন
