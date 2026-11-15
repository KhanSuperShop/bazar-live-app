(function () {
  // ==============================================================
   // আপনার Supabase প্রোজেক্ট URL (বসানো আছে) এবং Anon Key বসান
  // ==============================================================
  const SUPABASE_URL = "https://kuecacvhadqzywvkmauo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI"; // <-- এখানে আপনার কপি করা anon public key বসান

  const API_ENDPOINT = `${SUPABASE_URL}/rest/v1/shop_settings?id=eq.1`;
  const HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  document.addEventListener("DOMContentLoaded", async function () {
    const isAdminPage =
      document.body.innerText.includes("এডমিন প্যানেল") ||
      document.body.innerText.includes("নতুন পণ্য যোগ করুন");

    let settings = {};
    try {
      const res = await fetch(API_ENDPOINT, {
        headers: HEADERS,
        cache: "no-store",
      });
      const data = await res.json();
      if (data && data.length > 0) settings = data[0];
    } catch (err) {
      console.error("Supabase থেকে ডাটা লোড হয়নি:", err);
    }

    // ==============================================================
    // ১. অ্যাডমিন প্যানেল কন্ট্রোল ফর্ম
    // ==============================================================
    if (isAdminPage) {
      const adminBox = document.createElement("div");
      adminBox.style.cssText =
        "background:#fff; padding:18px; margin:20px auto; max-width:500px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); border-top:4px solid #27ae60; font-family:sans-serif;";
      adminBox.innerHTML = `
        <h3 style="margin:0 0 12px 0; color:#2c3e50;">⚙️ কাস্টমার পেজ কন্ট্রোল (অফার ও লোকেশন)</h3>
        <label style="font-size:13px; font-weight:bold;">টপ অফার ব্যানার লেখা:</label>
        <input id="adm_offer" type="text" value="${settings.offer_text || ""}" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
        
        <label style="font-size:13px; font-weight:bold;">দোকানের ঠিকানা (লোকেশন):</label>
        <input id="adm_address" type="text" value="${settings.shop_address || ""}" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
        
        <label style="font-size:13px; font-weight:bold;">গুগল ম্যাপ লিংক:</label>
        <input id="adm_map" type="text" value="${settings.map_link || ""}" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
        
        <label style="font-size:13px; font-weight:bold;">হটলাইন মোবাইল নম্বর:</label>
        <input id="adm_phone" type="text" value="${settings.shop_phone || ""}" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">

        <label style="font-size:13px; font-weight:bold;">WhatsApp নম্বর (88 সহ):</label>
        <input id="adm_wa" type="text" value="${settings.whatsapp_number || ""}" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">

        <div style="display:flex; gap:10px;">
          <div style="flex:1;">
            <label style="font-size:13px; font-weight:bold;">ডেলিভারি চার্জ (৳):</label>
            <input id="adm_del_charge" type="number" value="${settings.delivery_charge || 30}" style="width:100%; padding:8px; margin:4px 0 12px 0; border:1px solid #ccc; border-radius:4px;">
          </div>
          <div style="flex:1;">
            <label style="font-size:13px; font-weight:bold;">ফ্রি ডেলিভারি মিনিমাম (৳):</label>
            <input id="adm_free_min" type="number" value="${settings.free_delivery_min || 500}" style="width:100%; padding:8px; margin:4px 0 12px 0; border:1px solid #ccc; border-radius:4px;">
          </div>
        </div>

        <button id="saveSettingsBtn" style="width:100%; background:#27ae60; color:#fff; border:none; padding:10px; font-weight:bold; border-radius:5px; cursor:pointer; font-size:15px;">সেটিংস আপডেট করুন</button>
        <p id="saveStatusMsg" style="margin:8px 0 0 0; font-size:13px; color:#27ae60; text-align:center; font-weight:bold;"></p>
      `;

      document.body.appendChild(adminBox);

      document
        .getElementById("saveSettingsBtn")
        .addEventListener("click", async () => {
          const btn = document.getElementById("saveSettingsBtn");
          btn.innerText = "সেভ হচ্ছে...";
          const updatedData = {
            offer_text: document.getElementById("adm_offer").value,
            shop_address: document.getElementById("adm_address").value,
            map_link: document.getElementById("adm_map").value,
            shop_phone: document.getElementById("adm_phone").value,
            whatsapp_number: document.getElementById("adm_wa").value,
            delivery_charge:
              parseInt(document.getElementById("adm_del_charge").value) || 0,
            free_delivery_min:
              parseInt(document.getElementById("adm_free_min").value) || 0,
          };

          const response = await fetch(API_ENDPOINT, {
            method: "PATCH",
            headers: HEADERS,
            body: JSON.stringify(updatedData),
          });

          btn.innerText = "সেটিংস আপডেট করুন";
          if (response.ok) {
            document.getElementById("saveStatusMsg").innerText =
              "✅ সফলভাবে আপডেট হয়েছে! কাস্টমার পেজে এখনই দেখাবে।";
          } else {
            document.getElementById("saveStatusMsg").innerText =
              "❌ আপডেট ব্যর্থ হয়েছে! Supabase Key চেক করুন।";
          }
        });
      return;
    }

    // ==============================================================
    // ২. কাস্টমার পেজ ফিচারসমূহ
    // ==============================================================
    if (settings.offer_text) {
      let replaced = false;
      document.querySelectorAll("div, p, span, marquee").forEach((el) => {
        if (
          el.innerText &&
          el.innerText.includes("ধামাকা অফার") &&
          el.children.length === 0
        ) {
          el.innerText = settings.offer_text;
          replaced = true;
        }
      });

      if (!replaced) {
        const banner = document.createElement("div");
        banner.style.cssText =
          "background:#e74c3c; color:#fff; text-align:center; padding:10px; font-weight:bold; font-size:14px; position:sticky; top:0; z-index:9999;";
        banner.innerText = settings.offer_text;
        document.body.prepend(banner);
      }
    }

    // লাইভ সার্চ বক্স
    const searchBox = document.createElement("div");
    searchBox.style.cssText =
      "text-align:center; margin:15px auto; padding:0 10px;";
    searchBox.innerHTML = `<input type="text" id="grocerySearch" placeholder="🔍 মুদি পণ্য খুঁজুন (যেমন: oil, lux, potol)..." style="width:90%; max-width:450px; padding:10px 15px; border:2px solid #27ae60; border-radius:25px; outline:none;">`;
    const header = document.querySelector("header, nav, h1, h2");
    if (header) header.parentNode.insertBefore(searchBox, header.nextSibling);

    setTimeout(() => {
      const input = document.getElementById("grocerySearch");
      const cards = Array.from(document.querySelectorAll("div")).filter(
        (el) =>
          el.innerText &&
          el.innerText.includes("কার্টে যোগ করুন") &&
          el.children.length < 10
      );
      if (input) {
        input.addEventListener("input", (e) => {
          const val = e.target.value.toLowerCase();
          cards.forEach(
            (c) =>
              (c.style.display = c.innerText.toLowerCase().includes(val)
                ? ""
                : "none")
          );
        });
      }

      // কার্টে ডেলিভারি চার্জ দেখানো
      const cartHeading = Array.from(document.querySelectorAll("h2, h3")).find(
        (el) => el.innerText && el.innerText.includes("বাজারের থলি")
      );
      if (cartHeading) {
        const info = document.createElement("div");
        info.style.cssText =
          "background:#eafaf1; border:1px dashed #27ae60; padding:8px; margin:8px 0; border-radius:5px; font-size:13px; color:#1e8449;";
        info.innerHTML = `🚚 ডেলিভারি চার্জ: <b>৳${settings.delivery_charge || 30}</b> (<b>৳${settings.free_delivery_min || 500}+</b> অর্ডারে ফ্রি)`;
        cartHeading.parentNode.insertBefore(info, cartHeading.nextSibling);
      }
    }, 1500);

    // নিচে লোকেশন ফুটার
    if (settings.shop_address) {
      const footer = document.createElement("div");
      footer.style.cssText =
        "background:#2c3e50; color:#fff; padding:20px; margin-top:30px; text-align:center; font-family:sans-serif;";
      footer.innerHTML = `
        <h3 style="margin:0 0 6px 0;">📍 খান সুপার শপ - আমাদের ঠিকানা</h3>
        <p style="margin:0 0 6px 0; font-size:14px;">${settings.shop_address}</p>
        <p style="margin:0 0 12px 0; font-size:14px;">📞 হটলাইন: ${settings.shop_phone || ""}</p>
        ${settings.map_link ? `<a href="${settings.map_link}" target="_blank" style="background:#2ed573; color:#fff; padding:8px 15px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:13px;">গুগল ম্যাপে দেখুন</a>` : ""}
      `;
      document.body.appendChild(footer);
    }

    // ভাসমান WhatsApp বাটন
    if (settings.whatsapp_number) {
      const wa = document.createElement("a");
      wa.href = `https://wa.me{settings.whatsapp_number}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি বাজারের লিস্ট পাঠাতে চাই:")}`;
      wa.target = "_blank";
      wa.innerText = "📝 বাজারের লিস্ট (WhatsApp)";
      wa.style.cssText =
        "position:fixed; bottom:18px; right:18px; background:#25D366; color:#fff; padding:11px 16px; border-radius:30px; text-decoration:none; font-weight:bold; z-index:9999; font-size:13px; box-shadow:0 4px 10px rgba(0,0,0,0.3);";
      document.body.appendChild(wa);
    }
  });
})();
