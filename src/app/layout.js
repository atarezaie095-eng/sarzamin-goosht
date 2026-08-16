import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const title = "سرزمین گوشت | گوشت تازه و محصولات پروتئینی در اندیشه";
const description = "فروشگاه سرزمین گوشت در فاز ۳ اندیشه؛ عرضه گوشت، مرغ و محصولات پروتئینی تازه و باکیفیت با امکان سفارش از واتساپ و روبیکا و ارسال محلی.";

export const metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: title, template: "%s | سرزمین گوشت" },
  description,
  applicationName: "سرزمین گوشت",
  keywords: ["سرزمین گوشت", "گوشت تازه", "فروشگاه گوشت اندیشه", "پروتئینی اندیشه", "گوشت فاز ۳ اندیشه", "مرغ تازه", "جوجه طعم‌دار"],
  authors: [{ name: "سرزمین گوشت" }],
  creator: "سرزمین گوشت",
  publisher: "سرزمین گوشت",
  category: "فروشگاه محصولات پروتئینی",
  ...(siteUrl ? { alternates: { canonical: "/", languages: { "fa-IR": "/" } } } : {}),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png", sizes: "1280x1280" }],
    shortcut: "/images/logo.png",
    apple: [{ url: "/images/logo.png", type: "image/png", sizes: "1280x1280" }],
  },
  openGraph: {
    title,
    description,
    siteName: "سرزمین گوشت",
    locale: "fa_IR",
    type: "website",
    ...(siteUrl ? { url: "/", images: [{ url: "/images/hero.jpg", width: 1536, height: 1024, alt: "محصولات تازه سرزمین گوشت" }] } : {}),
  },
  twitter: { card: "summary_large_image", title, description, ...(siteUrl ? { images: ["/images/hero.jpg"] } : {}) },
};

export const viewport = { themeColor: "#17120f", colorScheme: "light" };

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
        {children}
      </body>
    </html>
  );
}
