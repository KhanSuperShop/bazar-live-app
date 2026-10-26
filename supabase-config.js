// ১. আপনার গুগল শিটের ডেটা লিঙ্ক সরাসরি সেট করা হয়েছে (কোনো পরিবর্তন করবেন না)
const GOOGLE_SHEET_DATA_URL =https://docs.google.com/spreadsheets/d/14CNlEWMzS1bzb5U9RuW-za3M5dYxkFVOyHxSZ1g5FVQ/edit?usp=sharing/gviz/tq?tqx=out:json&sheet=PRODUCTS";

// ২. কাস্টমার পেজ লোড হওয়ার প্রসেস
window.addEventListener('DOMContentLoaded', () => {
    const sampleCard = document.querySelector('.card');
    // শুধুমাত্র ইনডেক্স/কাস্টমার পেজ হলে ডেটা লোড করবে
    if (sampleCard && !document.getElementById('addProductForm')) {
        loadProductsFromGoogleSheet(sampleCard);
    }
});

async function loadProductsFromGoogleSheet(sampleCard) {
    try {
        const response = await fetch(GOOGLE_SHEET_DATA_URL);
        const text = await response.text();
        
        // গুগল শিটের ডাটা সঠিকভাবে পার্স (Parse) করা
        const jsonData = JSON.parse(text.substring(47).slice(0, -2));
        const rows = jsonData.table.rows;
        
        const gridContainer = sampleCard.parentElement;
        if (!gridContainer) return;

        rows.forEach(row => {
            if (!row.c) return;
            
            // আপনার শিটের কলাম পজিশন: কলাম C (NAME), কলাম D (PRICE), কলাম E (Image_URL)
            const name = row.c[2] ? row.c[2].v : null;
            const price = row.c[3] ? row.c[3].v : null;
            const imageUrl = row.c[4] ? row.c[4].v : 'https://placeholder.com';

            // নাম এবং দাম থাকলে পণ্যটি ওয়েবসাইটে কার্ড আকারে যুক্ত হবে
            if (name && price) {
                const card = `
                    <div class="card" style="margin: 10px; display: inline-block; vertical-align: top;">
                        <div style="text-align:center;">
                            <img src="${imageUrl}" width="120" height="120" style="object-fit:cover; border-radius:8px;">
                        </div>
                        <h3>${name}</h3>
                        <p>${price} টাকা</p>
                        <button class="btn-submit" onclick="addToCart('${name}', ${price})" style="width:100%;">কার্টে যোগ করুন</button>
                    </div>
                `;
                gridContainer.insertAdjacentHTML('afterbegin', card);
            }
        });
    } catch (error) {
        console.error("গুগল শিট থেকে ডাটা লোড করতে সমস্যা হয়েছে:", error);
    }
}
