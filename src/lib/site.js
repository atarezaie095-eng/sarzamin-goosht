export const site = {
  mobileDisplay: "۰۹۱۰۱۵۹۷۹۸۹",
  mobile: "+989101597989",
  landlineDisplay: "۰۲۱۶۵۵۷۳۱۰۶ و ۷",
  landline: "+982165573106",
  whatsappNumber: "989101597989",
  rubikaUsername: "09101597989",
  instagramUsername: "sarzamin_gosht",
  address: "اندیشه فاز ۳ ـ شهرک صدف ـ خیابان دکتر قریب ـ نرسیده به چهارراه توحید",
  deliveryArea: "اندیشه فاز ۱ ـ ۳ ـ ۴",
};

export const contactLinks = {
  phone: `tel:${site.mobile}`,
  landline: `tel:${site.landline}`,
  whatsapp: `https://wa.me/${site.whatsappNumber}`,
  rubika: `https://rubika.ir/${site.rubikaUsername}`,
  instagram: `https://instagram.com/${site.instagramUsername}`,
  map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`,
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`,
};

export function whatsappOrderLink(productName) {
  const message = productName
    ? `سلام، برای سفارش «${productName}» پیام می‌دهم.`
    : "سلام، برای ثبت سفارش از سرزمین گوشت پیام می‌دهم.";
  return `${contactLinks.whatsapp}?text=${encodeURIComponent(message)}`;
}
