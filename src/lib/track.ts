// Google Analytics events. The tag itself is in index.html and only reports on
// the real domain, so these calls do nothing locally, on the vercel.app copy,
// in the admin, or when a visitor's browser blocks Analytics.

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

export function track(name: string, params: Record<string, unknown> = {}) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (gtag) gtag("event", name, params);
}

// A sale is reported once per checkout, even when the thank-you page is
// reloaded or opened again from the receipt email.
export function trackPurchase(checkoutId: string, valueCents: number, item: string, quantity: number) {
  const key = `wf.ga.purchase.${checkoutId}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: report anyway; Analytics also drops repeats of a transaction_id.
  }
  track("purchase", {
    transaction_id: checkoutId,
    currency: "USD",
    value: valueCents / 100,
    items: [{ item_name: item, quantity }],
  });
}
