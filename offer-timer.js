// offer-timer.js (স্বয়ংসম্পূর্ণ ভার্সন - মূল কোডের কোনো ভেরিয়েবলের দরকার নেই)
(async function () {
  // ১. আপনার মূল কোড থেকে কপি করা Supabase URL ও Key এখানে বসান
  const SB_URL = "https://kuecacvhadqzywvkmauo.supabase.co";
  const SB_KEY = "sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI";

  try {
    // ২. সরাসরি Supabase থেকে যেসব পণ্যে offer_end_time আছে সেগুলো আনা
    const res = await fetch(`${SB_URL}/rest/v1/products?select=*`, {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
      },
    });
    const products = await res.json();

    // ৩. পেজে প্রোডাক্ট কার্ড লোড হওয়ার পর টাইমার বসানো
    const waitForCards = setInterval(() => {
      const buttons = Array.from(document.querySelectorAll("button")).filter((btn) =>
        btn.innerText.includes("কার্টে যোগ করুন")
      );

      if (buttons.length > 0 && Array.isArray(products)) {
        clearInterval(waitForCards);

        products.forEach((item) => {
          if (!item.offer_end_time) return;

          // পণ্যের নাম বা টাইটেল (আপনার টেবিলে যে নামেই থাকুক না কেন)
          const productName = item.name || item.title || item.product_name;
          if (!productName) return;

          // কার্ড খুঁজে বের করা
          const targetBtn = buttons.find((btn) => {
            const card = btn.closest("div");
            return card && card.innerText.includes(productName);
          });

          if (targetBtn) {
            const card = targetBtn.closest("div");
            if (card.querySelector(".custom-offer-timer")) return;

            const timerBox = document.createElement("div");
            timerBox.className = "custom-offer-timer";
            timerBox.style.cssText =
              "background:#d32f2f; color:#fff; font-size:12px; font-weight:bold; padding:4px 6px; border-radius:5px; margin:6px 0; text-align:center;";
            
            targetBtn.parentNode.insertBefore(timerBox, targetBtn);

            const endTime = new Date(item.offer_end_time).getTime();

            const interval = setInterval(() => {
              const now = new Date().getTime();
              const diff = endTime - now;

              if (diff <= 0) {
                clearInterval(interval);
                timerBox.remove();
                return;
              }

              const d = Math.floor(diff / (1000 * 60 * 60 * 24));
              const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const s = Math.floor((diff % (1000 * 60)) / 1000);

              timerBox.innerText =
                d > 0
                  ? `⏳ অফার বাকি: ${d}d ${h}h : ${m}m : ${s}s`
                  : `⏳ অফার বাকি: ${h}h : ${m}m : ${s}s`;
            }, 1000);
          }
        });
      }
    }, 500);
  } catch (err) {
    console.error("Offer timer error:", err);
  }
})();
