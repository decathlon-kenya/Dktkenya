function updatePromiseKEDeliveryText() {
    const nowUTC = new Date();
    const eatOffsetMs = 3 * 60 * 60 * 1000;
    const nowEAT = new Date(nowUTC.getTime() + eatOffsetMs);

    const hours = nowEAT.getUTCHours();

    const deliveryText = (hours >= 1 && hours < 14)
      ? "Delivery Today: From 2PM*"
      : "Fast Countrywide Delivery";

    document.getElementById("PromiseKE-dynamic-text").innerText = deliveryText;
  }

updatePromiseKEDeliveryText();
