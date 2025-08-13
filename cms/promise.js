function updatePromiseKEDeliveryText() {
    const nowUTC = new Date();
    const eatOffsetMs = 3 * 60 * 60 * 1000;
    const nowEAT = new Date(nowUTC.getTime() + eatOffsetMs);

    const hours = nowEAT.getUTCHours();

    // Get short weekday names
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayIndex = nowEAT.getUTCDay();
    const deliveryDay = weekdays[todayIndex];

    const deliveryText = (hours >= 1 && hours < 23)
      ? `Next Delivery: ${deliveryDay}, From 2PM`
      : "Fast Countrywide Delivery";

    document.getElementById("PromiseKE-dynamic-text").innerText = deliveryText;
}

updatePromiseKEDeliveryText();
