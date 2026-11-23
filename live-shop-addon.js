(function() {
  var U = "https://" + "kuecacvhadqzywvkmauo" + ".supabase.co";
  var K = "sb_publishable_ijrPXf2ssOl-5usaMmSNgw_VNpkJkpI";
  var SHOP_WA = "8801717888666";
  var liveProducts = [];

  var pStyle = document.createElement("style");
  pStyle.innerHTML = "@media print { body * { visibility: hidden !important; } #addon-receipt-modal, #addon-receipt-body, #addon-receipt-body * { visibility: visible !important; } #addon-receipt-modal { position: fixed !important; left: 0 !important; top: 0 !important; background: #fff !important; align-items: flex-start !important; padding: 0 !important; } #addon-rcp-btns, #addon-wa-btn { display: none !important; } }";
  document.head.appendChild(pStyle);

  function setupWhatsAppBtn() {
    if (document.getElementById("addon-wa-btn")) return;
    var a = document.createElement("a");
    a.id = "addon-wa-btn";
    a.href = "https://wa.me" + SHOP_WA + "?text=" + encodeURIComponent("আসসালামু আলাইকুম, খান সুপার শপ থেকে বাজার অর্ডার করতে চাই।");
    a.target = "_blank";
    a.title = "WhatsApp-এ অর্ডার বা যোগাযোগ করুন";
    a.style.cssText = "position:fixed; bottom:20px; right:20px; background:#25D366; color:#fff; width:54px; height:54px; border-radius:50%; display:flex; justify-content:center; align-items:center; box-shadow:0 4px 12px rgba(0,0,0,0.28); z-index:99990; text-decoration:none; font-size:28px;";
    a.innerHTML = "💬";
    document.body.appendChild(a);
  }

  function setupLiveSearch() {
    if (document.getElementById("addon-live-search-wrap")) return;
    var headings = document.querySelectorAll("h1, h2, h3");
    var targetHeading = null;
    for (var i = 0; i < headings.length; i++) {
      if (headings.item(i) && headings.item(i).innerText.includes("আমাদের পণ্যসমূহ")) {
        targetHeading = headings.item(i);
        break;
      }
    }

    var wrap = document.createElement("div");
    wrap.id = "addon-live-search-wrap";
    wrap.style.cssText = "max-width:520px; margin:12px auto 16px auto; padding:0 12px;";
    wrap.innerHTML =
      "<div style='position:relative; display:flex; align-items:center;'>" +
        "<input type='text' id='addon-live-search-input' placeholder='🔍 পণ্যের নাম লিখে খুঁজুন... (যেমন: চাল, তেল, চিনি)' style='width:100%; padding:11px 38px 11px 14px; border:2px solid #28a745; border-radius:25px; font-size:15px; outline:none; box-shadow:0 2px 6px rgba(40,167,69,0.12); box-sizing:border-box;'>" +
        "<button type='button' id='addon-live-search-clear' style='display:none; position:absolute; right:12px; background:#eee; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-weight:bold; color:#555; font-size:12px;'>✖</button>" +
      "</div>";

    if (targetHeading) targetHeading.insertAdjacentElement("afterend", wrap);
    else (document.querySelector("main") || document.body).insertAdjacentElement("afterbegin", wrap);

    var inputEl = document.getElementById("addon-live-search-input");
    var clearBtn = document.getElementById("addon-live-search-clear");

    function filterCards() {
      var q = inputEl.value.trim().toLowerCase();
      clearBtn.style.display = q.length > 0 ? "block" : "none";
      document.querySelectorAll("div").forEach(function(card) {
        var btn = card.querySelector("button");
        if (!btn || card.children.length > 8 || card.offsetHeight > 460 || card.offsetHeight < 120) return;
        var txt = (card.innerText || "").toLowerCase();
        if (!txt.includes("৳")) return;
        card.style.display = (q === "" || txt.includes(q)) ? "" : "none";
      });
    }

    inputEl.addEventListener("input", filterCards);
    clearBtn.addEventListener("click", function() {
      inputEl.value = "";
      filterCards();
      inputEl.focus();
    });
  }

  async function syncStockBadges() {
    try {
      var r = await fetch(U + "/rest/v1/products?select=id,title,stock,in_stock", {
        headers: { "apikey": K, "Authorization": "Bearer " + K }
      });
      if (!r.ok) return;
      liveProducts = await r.json();
      applyOutOfStockUI();
    } catch (e) {}
  }

  function applyOutOfStockUI() {
    if (!liveProducts || liveProducts.length === 0) return;
    document.querySelectorAll("div").forEach(function(card) {
      var btn = card.querySelector("button");
      if (!btn || card.children.length > 8 || card.offsetHeight > 460 || card.offsetHeight < 120) return;
      var txt = card.innerText || "";
      if (!txt.includes("৳")) return;

      var matched = liveProducts.find(function(p) {
        return p.title && txt.includes(p.title.trim());
      });

      if (matched) {
        var isOut = (matched.in_stock === false) || (matched.stock !== null && matched.stock !== undefined && Number(matched.stock) <= 0);
        if (isOut) {
          card.style.position = "relative";
          card.style.opacity = "0.65";
          card.style.pointerEvents = "none";
          if (!card.querySelector(".addon-oos-badge")) {
            var badge = document.createElement("div");
            badge.className = "addon-oos-badge";
            badge.innerText = "🚫 স্টক শেষ";
            badge.style.cssText = "position:absolute; top:8px; right:8px; background:#d32f2f; color:#fff; padding:4px 9px; border-radius:4px; font-size:12px; font-weight:bold; z-index:10; box-shadow:0 2px 5px rgba(0,0,0,0.2);";
            card.appendChild(badge);
          }
          if (btn) {
            btn.innerText = "স্টক শেষ";
            btn.style.background = "#888";
            btn.disabled = true;
          }
        }
      }
    });
  }
  function setupOrderReceipt() {
    var modal = document.createElement("div");
    modal.id = "addon-receipt-modal";
    modal.style.cssText = "display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:999999; justify-content:center; align-items:center; padding:15px;";
    modal.innerHTML =
      "<div style='background:#fff; width:100%; max-width:380px; border-radius:10px; padding:20px; box-shadow:0 8px 25px rgba(0,0,0,0.3); font-family:sans-serif; color:#222; max-height:90vh; overflow-y:auto;'>" +
        "<div id='addon-receipt-body'></div>" +
        "<div id='addon-rcp-btns' style='display:flex; gap:10px; margin-top:15px;'>" +
          "<button type='button' id='addon-rcp-print' style='flex:1; background:#28a745; color:#fff; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;'>🖨 প্রিন্ট / সেভ</button>" +
          "<button type='button' id='addon-rcp-close' style='flex:1; background:#dc3545; color:#fff; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;'>✖ বন্ধ করুন</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(modal);

    document.getElementById("addon-rcp-close").onclick = function() {
      modal.style.display = "none";
    };
    document.getElementById("addon-rcp-print").onclick = function() {
      window.print();
    };

    var origFetch = window.fetch;
    window.fetch = async function(url, opts) {
      var res = await origFetch.apply(this, arguments);
      try {
        if (typeof url === "string" && url.includes("/rest/v1/orders") && opts && opts.method && opts.method.toUpperCase() === "POST" && res.ok) {
          var bodyData = JSON.parse(opts.body);
          var order = Array.isArray(bodyData) ? bodyData.at(0) : bodyData;
          if (order && order.items) showDigitalReceipt(order);
        }
      } catch (e) {}
      return res;
    };
  }

  function showDigitalReceipt(order) {
    var now = new Date();
    var timeStr = now.toLocaleDateString("bn-BD") + " | " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    var items = Array.isArray(order.items) ? order.items : [];

    var rows = items.map(function(it, idx) {
      var name = it.title || it.name || "পণ্য";
      var qty = it.quantity || it.qty || 1;
      var price = Number(it.price) || 0;
      var lineTotal = price * qty;
      return "<tr>" +
        "<td style='padding:6px 2px; border-bottom:1px solid #eee;'>" + (idx + 1) + ". " + name + "</td>" +
        "<td style='padding:6px 2px; border-bottom:1px solid #eee; text-align:center;'>" + qty + "</td>" +
        "<td style='padding:6px 2px; border-bottom:1px solid #eee; text-align:right;'>৳" + lineTotal + "</td>" +
      "</tr>";
    }).join("");

    var totalAmt = order.total_amount || 0;
    document.getElementById("addon-receipt-body").innerHTML =
      "<div style='text-align:center; border-bottom:2px dashed #28a745; padding-bottom:10px; margin-bottom:10px;'>" +
        "<div style='font-size:28px;'>✅</div>" +
        "<h2 style='margin:4px 0; color:#28a745; font-size:20px;'>খান সুপার শপ</h2>" +
        "<div style='font-size:12px; color:#555;'>5, Amtola Road, Jhalokathi | +8801717888666</div>" +
        "<div style='background:#e8f5e9; color:#2e7d32; display:inline-block; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:bold; margin-top:6px;'>অর্ডার সফলভাবে গৃহীত হয়েছে!</div>" +
        "<div style='font-size:11px; color:#777; margin-top:4px;'>" + timeStr + "</div>" +
      "</div>" +
      "<div style='font-size:13px; line-height:1.6; margin-bottom:10px; background:#f8f9fa; padding:8px; border-radius:6px;'>" +
        "<div><strong>গ্রাহকের নাম:</strong> " + (order.customer_name || "সম্মানিত ক্রেতা") + "</div>" +
        "<div><strong>মোবাইল:</strong> " + (order.phone_number || "N/A") + "</div>" +
        "<div><strong>ঠিকানা:</strong> " + (order.delivery_address || "N/A") + "</div>" +
      "</div>" +
      "<table style='width:100%; border-collapse:collapse; font-size:13px; margin-bottom:10px;'>" +
        "<thead><tr style='border-bottom:1px solid #333;'><th style='text-align:left; padding:4px 2px;'>পণ্য</th><th style='text-align:center; padding:4px 2px;'>পরিমাণ</th><th style='text-align:right; padding:4px 2px;'>দাম</th></tr></thead>" +
        "<tbody>" + rows + "</tbody>" +
      "</table>" +
      "<div style='border-top:2px solid #28a745; padding-top:8px; text-align:right;'>" +
        "<div style='font-size:17px; font-weight:bold; color:#d32f2f;'>সর্বমোট বিল: ৳" + totalAmt + " টাকা</div>" +
        "<div style='font-size:11px; color:#555; margin-top:2px;'>(ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা পরিশোধ করুন)</div>" +
      "</div>";

    document.getElementById("addon-receipt-modal").style.display = "flex";
  }

  function initLiveAddon() {
    setupWhatsAppBtn();
    setupLiveSearch();
    setupOrderReceipt();
    syncStockBadges();
    setTimeout(applyOutOfStockUI, 1500);
    setTimeout(applyOutOfStockUI, 3500);

    document.addEventListener("click", function(e) {
      if (e.target && e.target.tagName === "BUTTON" && e.target.id !== "addon-live-search-clear") {
        setTimeout(applyOutOfStockUI, 300);
        var inp = document.getElementById("addon-live-search-input");
        if (inp && inp.value.trim() !== "") {
          inp.value = "";
          var clr = document.getElementById("addon-live-search-clear");
          if (clr) clr.style.display = "none";
        }
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initLiveAddon);
  else initLiveAddon();
})();
