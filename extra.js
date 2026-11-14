document.addEventListener("DOMContentLoaded", function () {
  // ==============================================================
  // ১. মুদি দোকানের কন্ট্রোল প্যানেল (এখান থেকে সবকিছু পরিবর্তন করুন)
  // ==============================================================
  const shopConfig = {
    // টপ অফার ব্যানার
    offerBanner: {
      show: true,
      text: "🔥 ধামাকা অফার! ৫০০ টাকার মুদি বাজার করলেই ডেলিভারি চার্জ একদম ফ্রি! 🔥",
      bgColor: "#e74c3c"
    },

    // দোকান খোলা ও বন্ধের সময় (২৪ ঘণ্টার ফরম্যাটে)
    shopHours: {
      show: true,
      openHour: 8,   // সকাল ৮টা
      closeHour: 22, // রাত ১০টা
      noticeText: "⏰ প্রতিদিন সকাল ৮টা থেকে রাত ১০টা পর্যন্ত হোম ডেলিভারি চালু থাকে।"
    },

    // ডেলিভারি চার্জ সেটিংস
    deliveryInfo: {
      show: true,
      charge: 30,             // সাধারণ ডেলিভারি চার্জ (টাকা)
      freeDeliveryMin: 500,   // কত টাকার উপরে অর্ডার করলে ফ্রি ডেলিভারি
      deliveryTime: "৩০ - ৪৫ মিনিটের মধ্যে দ্রুত ডেলিভারি"
    },

    // পণ্যের গায়ে অফার বা স্টক ট্যাগ (পণ্যের নাম ছোট হাতের অক্ষরে লিখুন)
    productTags: {
      "lux": "১০% ছাড়",
      "oil": "হট ডিল",
      "potol": "তাজা সবজি",
      "alu": "ফ্রেশ",
      "tometo": "দেশি",
      "birthday cake": "স্পেশাল",
      "motor": "স্টক সীমিত"
    },

    // দোকানের লোকেশন ও ঠিকানা
    shopLocation: {
      show: true,
      title: "খান সুপার শপ - আপনার বিশ্বস্ত মুদি দোকান",
      address: "মেইন রোড, সদর বাজার, ঝালকাঠি",
      phone: "01710666777",
      mapLink: "https://google.com"
    },

    // ছবি তুলে বা বাজারের লিস্ট লিখে WhatsApp-এ অর্ডার
    whatsapp: {
      show: true,
      number: "8801710666777", // 88 সহ নম্বর দিন
      message: "আসসালামু আলাইকুম, আমি খান সুপার শপে আমার বাজারের লিস্ট পাঠাতে চাই:"
    }
  };

  // ==============================================================
  // ২. অটোমেটিক ফিচার ইঞ্জিন (নিচের কোডে হাত দেওয়ার প্রয়োজন নেই)
  // ==============================================================

  // (ক) টপ অফার ব্যানার
  if (shopConfig.offerBanner.show) {
    const banner = document.createElement("div");
    banner.style.cssText = `background:${shopConfig.offerBanner.bgColor}; color:#fff; text-align:center; padding:10px; font-weight:bold; font-size:14px; position:sticky; top:0; z-index:9999; box-shadow:0 2px 5px rgba(0,0,0,0.2);`;
    banner.innerHTML = shopConfig.offerBanner.text;
    document.body.prepend(banner);
  }

  // (খ) দোকান খোলা/বন্ধের স্ট্যাটাস বার ও সার্চ বক্স তৈরি
  const controlBar = document.createElement("div");
  controlBar.style.cssText = "max-width:1100px; margin:15px auto; padding:12px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08); text-align:center; font-family:sans-serif;";

  let statusHTML = "";
  if (shopConfig.shopHours.show) {
    const currentHour = new Date().getHours();
    const isOpen = currentHour >= shopConfig.shopHours.openHour && currentHour < shopConfig.shopHours.closeHour;
    const statusBadge = isOpen
      ? `<span style="background:#2ecc71; color:#fff; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:bold;">🟢 এখন দোকান খোলা</span>`
      : `<span style="background:#e74c3c; color:#fff; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:bold;">🔴 এখন বন্ধ (অর্ডার করলে সকালে ডেলিভারি)</span>`;
    statusHTML = `<div style="margin-bottom:10px;">${statusBadge} <span style="font-size:13px; color:#555; margin-left:5px;">${shopConfig.shopHours.noticeText}</span></div>`;
  }

  // লাইভ পণ্য সার্চ ইনপুট
  controlBar.innerHTML = `
    ${statusHTML}
    <input type="text" id="grocerySearchInput" placeholder="🔍 আপনার প্রয়োজনীয় মুদি পণ্য খুঁজুন (যেমন: oil, alu, lux, potol)..." 
    style="width:90%; max-width:500px; padding:10px 15px; border:2px solid #27ae60; border-radius:25px; font-size:14px; outline:none;">
  `;

  // হেডারের ঠিক নিচে সার্চ ও স্ট্যাটাস বার বসানো
  const firstHeader = document.querySelector("header, nav, h1, h2");
  if (firstHeader && firstHeader.parentNode) {
    firstHeader.parentNode.insertBefore(controlBar, firstHeader.nextSibling);
  } else {
    document.body.prepend(controlBar);
  }

  // (গ) লাইভ সার্চ ফিল্টার ফাংশন এবং পণ্যে অফার ট্যাগ বসানো
  setTimeout(() => {
    const searchInput = document.getElementById("grocerySearchInput");
    const productCards = [];

    document.querySelectorAll("div").forEach((card) => {
      if (card.innerText && card.innerText.includes("কার্টে যোগ করুন") && card.children.length < 10) {
        productCards.push(card);
        const lines = card.innerText.split("\n").map(line => line.trim()).filter(Boolean);
        const productName = lines ? lines.toLowerCase() : "";

        // অফার বা তাজা ট্যাগ বসানো
        if (shopConfig.productTags[productName]) {
          card.style.position = "relative";
          const badge = document.createElement("span");
          badge.innerText = shopConfig.productTags[productName];
          badge.style.cssText = "position:absolute; top:8px; right:8px; background:#e67e22; color:#fff; padding:3px 8px; font-size:11px; font-weight:bold; border-radius:4px; z-index:10;";
          card.appendChild(badge);
        }
      }
    });

    // সার্চ বক্সে টাইপ করলে পণ্য ফিল্টার হওয়া
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        const keyword = e.target.value.toLowerCase().trim();
        productCards.forEach((card) => {
          const text = card.innerText.toLowerCase();
          card.style.display = text.includes(keyword) ? "" : "none";
        });
      });
    }

    // (ঘ) বাজারের থলি (Cart) অংশে ডেলিভারি চার্জ ও ফ্রি ডেলিভারি তথ্য যোগ করা
    if (shopConfig.deliveryInfo.show) {
      document.querySelectorAll("div, h2, h3").forEach((el) => {
        if (el.innerText && el.innerText.includes("বাজারের থলি")) {
          const deliveryBox = document.createElement("div");
          deliveryBox.style.cssText = "background:#eafaf1; border:1px dashed #27ae60; padding:10px; margin:10px 0; border-radius:6px; font-size:13px; color:#1e8449; text-align:left;";
          deliveryBox.innerHTML = `
            <strong>🚚 ডেলিভারি তথ্য:</strong><br>
            • সাধারণ ডেলিভারি চার্জ: <b>৳${shopConfig.deliveryInfo.charge}</b><br>
            • <b>৳${shopConfig.deliveryInfo.freeDeliveryMin}+</b> টাকার বাজারে ডেলিভারি <b>ফ্রি!</b><br>
            • সময়: ${shopConfig.deliveryInfo.deliveryTime}
          `;
          el.parentNode.insertBefore(deliveryBox, el.nextSibling);
        }
      });
    }
  }, 1500);

  // (ঙ) ফুটারে দোকানের লোকেশন, ক্যাশ অন ডেলিভারি ব্যাজ ও ঠিকানা
  if (shopConfig.shopLocation.show) {
    const footer = document.createElement("div");
    footer.style.cssText = "background:#2c3e50; color:#fff; padding:25px 15px; margin-top:40px; text-align:center; font-family:sans-serif;";
    footer.innerHTML = `
      <div style="margin-bottom:12px;">
        <span style="background:#27ae60; padding:4px 10px; border-radius:4px; font-size:12px; margin:0 4px;">💵 ক্যাশ অন ডেলিভারি</span>
        <span style="background:#2980b9; padding:4px 10px; border-radius:4px; font-size:12px; margin:0 4px;">🥬 ১০০% ফ্রেশ পণ্য</span>
      </div>
      <h3 style="margin:0 0 8px 0;">📍 ${shopConfig.shopLocation.title}</h3>
      <p style="margin:0 0 6px 0; font-size:14px;">${shopConfig.shopLocation.address}</p>
      <p style="margin:0 0 14px 0; font-size:14px;">📞 হটলাইন: ${shopConfig.shopLocation.phone}</p>
      <a href="${shopConfig.shopLocation.mapLink}" target="_blank" style="display:inline-block; background:#2ed573; color:#fff; padding:9px 18px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:14px;">গুগল ম্যাপে দোকান দেখুন</a>
    `;
    document.body.appendChild(footer);
  }

  // (চ) খাতার লিস্ট লিখে WhatsApp-এ অর্ডারের ভাসমান বাটন
  if (shopConfig.whatsapp.show) {
    const waBtn = document.createElement("a");
    waBtn.href = `https://wa.me{shopConfig.whatsapp.number}?text=${encodeURIComponent(shopConfig.whatsapp.message)}`;
    waBtn.target = "_blank";
    waBtn.innerHTML = "📝 বাজারের লিস্ট পাঠান (WhatsApp)";
    waBtn.style.cssText = "position:fixed; bottom:18px; right:18px; background:#25D366; color:#fff; padding:12px 16px; border-radius:30px; text-decoration:none; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999; font-size:13px;";
    document.body.appendChild(waBtn);
  }
});
