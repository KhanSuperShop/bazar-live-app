// offer-timer.js
document.addEventListener("DOMContentLoaded", () => {
  // প্রতি ১ সেকেন্ড পরপর চেক করবে পেজে প্রোডাক্ট কার্ড লোড হয়েছে কি না
  const checkProducts = setInterval(() => {
    // আপনার ওয়েবসাইটের প্রোডাক্ট কার্ডগুলো খুঁজে বের করা
    const productCards = document.querySelectorAll(".product-card, [data-product-id]"); 
    
    if (productCards.length > 0 && typeof productsData !== "undefined") {
      clearInterval(checkProducts);
      initAllTimers(productsData);
    }
  }, 500);
});

function initAllTimers(products) {
  products.forEach((product) => {
    if (!product.offer_end_time) return;

    // পণ্যের নাম দিয়ে কার্ডটি খুঁজে বের করা
    const cards = Array.from(document.querySelectorAll("div, article, li"));
    const targetCard = cards.find(el => el.innerText && el.innerText.includes(product.name) && el.querySelector("button"));

    if (targetCard && !targetCard.querySelector(".custom-offer-timer")) {
      const timerBadge = document.createElement("div");
      timerBadge.className = "custom-offer-timer";
      timerBadge.style.cssText = "background:#d32f2f; color:#fff; font-size:12px; font-weight:bold; padding:4px 8px; border-radius:4px; margin-top:5px; text-align:center;";
      
      // কার্ডের দামের নিচে বা বাটনের উপরে টাইমার বসানো
      targetCard.insertBefore(timerBadge, targetCard.querySelector("button"));

      const endTime = new Date(product.offer_end_time).getTime();

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance <= 0) {
          clearInterval(timer);
          timerBadge.remove();
          return;
        }

        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        timerBadge.innerText = `⏳ অফার শেষ হতে বাকি: ${h}h : ${m}m : ${s}s`;
      }, 1000);
    }
  });
}
