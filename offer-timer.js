// offer-timer.js
function startProductOfferTimer(product, elementId) {
  const timerEl = document.getElementById(elementId);
  if (!timerEl) return;

  // যদি Supabase-এ offer_end_time খালি (NULL) থাকে, তবে টাইমার দেখাবে না
  if (!product.offer_end_time) {
    timerEl.style.display = "none";
    return;
  }

  const endTime = new Date(product.offer_end_time).getTime();

  function updateClock() {
    const now = new Date().getTime();
    const distance = endTime - now;

    // সময় শেষ হয়ে গেলে অটোমেটিক টাইমার হাইড হয়ে যাবে
    if (distance <= 0) {
      timerEl.style.display = "none";
      return;
    }

    timerEl.style.display = "inline-block";
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerEl.innerText = days > 0 
      ? `⏳ ${days}d ${hours}h : ${minutes}m : ${seconds}s` 
      : `⏳ ${hours}h : ${minutes}m : ${seconds}s`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}
