export const site = {
  phoneDisplay: "۰۹۱۲ ۰۰۰ ۰۰۰۰",
  phone: "+989120000000",
  whatsappNumber: "989120000000",
  rubikaUsername: "sarzamingoosht",
  instagramUsername: "sarzamingoosht",
  address: "اندیشه، فاز ۳، آدرس فروشگاه",
};

export const contactLinks = {
  phone: `tel:${site.phone}`,
  whatsapp: `https://wa.me/${site.whatsappNumber}`,
  rubika: `https://rubika.ir/${site.rubikaUsername}`,
  instagram: `https://instagram.com/${site.instagramUsername}`,
};

export function whatsappOrderLink(productName) {
  const message = productName
    ? `سلام، برای سفارش «${productName}» پیام می‌دهم.`
    : "سلام، برای ثبت سفارش از سرزمین گوشت پیام می‌دهم.";
  return `${contactLinks.whatsapp}?text=${encodeURIComponent(message)}`;
}
