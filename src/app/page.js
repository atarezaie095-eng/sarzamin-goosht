import { Suspense } from "react";
import Header from "@/components/Header";
import Image from "next/image";
import ProductShowcase from "@/components/ProductShowcase";
import ProductsSection from "@/components/ProductsSection";
import MotionController from "@/components/MotionController";
import { Icon } from "@/components/Icon";
import { contactLinks, site, whatsappOrderLink } from "@/lib/site";

const categories = [
  { name: "گوشت", icon: "meat", caption: "تازه و روزانه" },
  { name: "مرغ", icon: "chicken", caption: "کشتار روز" },
  { name: "سوسیس و کالباس", icon: "sausage", caption: "برندهای معتبر" },
  { name: "جوجه طعم‌دار", icon: "skewer", caption: "آماده طبخ" },
];

const reviews = [
  { name: "مریم احمدی", text: "کیفیت گوشت واقعاً عالی بود و سفارش خیلی سریع به دستم رسید. از این به بعد مشتری همیشگی‌تون هستم.", date: "خریدار گوشت گوسفندی" },
  { name: "علی رضایی", text: "بسته‌بندی تمیز، وزن دقیق و برخورد محترمانه. جوجه‌های طعم‌دار هم خیلی خوشمزه بودند.", date: "خریدار جوجه طعم‌دار" },
  { name: "سارا محمدی", text: "برای خرید روزانه در فاز ۳ بهترین انتخابه. محصولات همیشه تازه‌ان و ارسال هم به‌موقعه.", date: "مشتری همیشگی" },
];

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Header />
      <MotionController />
      <main id="main-content" className="overflow-hidden bg-[#fffdf9] text-[#181512]">

      <section id="home" aria-labelledby="hero-title" className="relative min-h-[730px] bg-[#17120f] pt-20 text-white lg:min-h-[760px]">
        <div className="hero-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-20">
          <div className="order-2 lg:order-1">
            <div className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[13px] text-white/85 backdrop-blur-sm sm:text-sm">
              <span className="size-2 animate-pulse rounded-full bg-[#e53b34]" />
              ارسال سریع در اندیشه، فاز ۳
            </div>
            <p className="mb-4 text-sm font-extrabold text-[#f05a52]">تازه، سالم، مطمئن</p>
            <h1 id="hero-title" className="max-w-2xl text-[2.5rem] font-black leading-[1.4] tracking-[-.035em] sm:text-5xl lg:text-[64px] lg:leading-[1.28]">
              طعم واقعی <span className="text-[#e7433c]">تازگی</span><br />روی سفره شما
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/70 sm:mt-7 sm:text-lg sm:leading-9">
              سرزمین گوشت، ارائه‌دهنده گوشت تازه و باکیفیت با بیش از ۵ سال تجربه؛ انتخابی مطمئن برای خانواده‌های اندیشه.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:mt-9">
              <a href={whatsappOrderLink()} target="_blank" rel="noopener noreferrer" className="btn-primary"><Icon name="whatsapp" /> سفارش از واتساپ</a>
              <a href={contactLinks.rubika} target="_blank" rel="noopener noreferrer" className="btn-ghost"><Icon name="send" /> سفارش از روبیکا</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[13px] text-white/70 sm:mt-10 sm:gap-x-7 sm:text-sm">
              <span className="flex items-center gap-2"><Icon name="check" /> تضمین تازگی</span>
              <span className="flex items-center gap-2"><Icon name="truck" /> ارسال سریع</span>
              <span className="flex items-center gap-2"><Icon name="shield" /> خرید مطمئن</span>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[520px] lg:order-2">
            <div className="hero-image group relative aspect-[4/3.65] overflow-hidden rounded-[2rem] border border-white/10 sm:rounded-[2.5rem] lg:aspect-[4/4.6]">
              <Image src="/images/hero.webp" alt="منتخبی از گوشت تازه و باکیفیت سرزمین گوشت" fill preload quality={90} sizes="(max-width: 1023px) 100vw, 520px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -right-2 flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3.5 text-[#17120f] shadow-2xl sm:-right-8 sm:p-4">
              <span className="grid size-12 place-items-center rounded-xl bg-[#fff0ed] text-[#d83730]"><Icon name="award" /></span>
              <div><strong className="block text-lg">+۵ سال</strong><span className="text-xs text-black/50">تجربه و اعتماد</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" aria-labelledby="categories-title" className="section-wrap">
        <div data-reveal><SectionHeading id="categories-title" eyebrow="انتخاب شما" title="دسته‌بندی محصولات" description="تازه‌ترین محصولات پروتئینی را با خیال راحت انتخاب کنید." /></div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:mt-11 md:grid-cols-4 md:gap-5">
          {categories.map((item, index) => (
            <a key={item.name} href="#products" data-reveal style={{ "--reveal-delay": `${index * 70}ms` }} className="category-card group">
              <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-[#fff0ed] text-[#d83b34] transition group-hover:-translate-y-1 group-hover:bg-[#df3b34] group-hover:text-white"><Icon name={item.icon} className="size-8" /></span>
              <h3 className="font-extrabold sm:text-lg">{item.name}</h3>
              <p className="mt-1 text-xs text-black/45 sm:text-sm">{item.caption}</p>
              <span className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#b92a25] opacity-100 transition md:mt-5 md:text-xs md:opacity-0 md:group-hover:opacity-100">مشاهده محصولات <Icon name="arrow" className="size-4" /></span>
            </a>
          ))}
        </div>
      </section>

      <Suspense fallback={<ProductShowcase loading />}>
        <ProductsSection />
      </Suspense>

      <section aria-labelledby="offer-title" className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div data-reveal className="offer-banner relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#d9342d] px-7 py-11 text-white shadow-[0_22px_55px_rgba(217,52,45,.18)] md:rounded-[2rem] md:px-14 md:py-14">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold">پیشنهاد ویژه این هفته</div>
            <h2 id="offer-title" className="text-3xl font-black leading-[1.55] tracking-[-.025em] md:text-4xl">یک خرید خوشمزه، با تخفیفی ویژه!</h2>
            <p className="mt-3 text-sm leading-7 text-white/85 md:text-base md:leading-8">برای اطلاع از تخفیف‌های روزانه و قیمت‌های ویژه، همین حالا در واتساپ پیام بدهید.</p>
            <a href={whatsappOrderLink()} target="_blank" rel="noopener noreferrer" className="animated-action mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#a9231f] transition hover:-translate-y-1 hover:shadow-xl">دریافت پیشنهادها <Icon name="arrow" /></a>
          </div>
          <span className="absolute -left-8 -top-12 text-[250px] font-black leading-none text-black/8">٪</span>
          <div className="absolute -bottom-16 left-[30%] size-56 rounded-full border-[35px] border-white/5" />
        </div>
      </section>

      <section id="about" aria-labelledby="about-title" className="section-wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div data-reveal className="relative mx-auto w-full max-w-[550px]">
          <div className="about-image relative aspect-[4/3.6] overflow-hidden rounded-[2rem]">
            <Image src="/images/store.webp" alt="فروشگاه سرزمین گوشت در فاز ۳ اندیشه" fill sizes="(max-width: 1023px) 100vw, 550px" className="object-cover" />
          </div>
          <div className="absolute -bottom-5 left-5 rounded-2xl bg-[#17120f] px-6 py-4 text-white shadow-xl sm:-left-5"><strong className="text-3xl text-[#ef4a43]">۵+</strong><span className="mr-2 text-sm">سال همراه شما</span></div>
        </div>
        <div data-reveal style={{ "--reveal-delay": "100ms" }}>
          <p className="section-eyebrow">داستان ما</p>
          <h2 id="about-title" className="section-title text-right">کیفیت، پایه‌ی اعتماد شماست</h2>
          <p className="mt-5 leading-8 text-black/65 sm:leading-9">سرزمین گوشت بیش از ۵ سال است که با ارائه محصولات تازه و باکیفیت، همراه سفره خانواده‌های اندیشه است. ما باور داریم خرید خوب از اعتماد شروع می‌شود؛ به همین دلیل تازگی، سلامت و رضایت شما اولویت همیشگی ماست.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Feature icon="sparkle" title="تازگی هر روز" text="تأمین روزانه و نگهداری اصولی" />
            <Feature icon="shield" title="کیفیت مطمئن" text="انتخاب از منابع قابل اعتماد" />
            <Feature icon="scale" title="وزن دقیق" text="شفافیت کامل در خرید شما" />
            <Feature icon="heart" title="رضایت مشتری" text="پاسخ‌گویی و همراهی همیشگی" />
          </div>
        </div>
      </section>

      <section aria-labelledby="reviews-title" className="bg-[#f6f1eb] py-20 sm:py-25">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div data-reveal><SectionHeading id="reviews-title" eyebrow="حرف دل مشتریان" title="تجربه خرید از ما" description="اعتماد شما، ارزشمندترین سرمایه سرزمین گوشت است." /></div>
          <div className="mt-10 grid gap-5 sm:mt-11 md:grid-cols-3">
            {reviews.map((review, index) => <Review key={review.name} {...review} index={index} />)}
          </div>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="section-wrap">
        <div data-reveal className="grid overflow-hidden rounded-[2rem] bg-[#191512] text-white lg:grid-cols-[.9fr_1.1fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="section-eyebrow">در ارتباط باشید</p>
            <h2 id="contact-title" className="mt-3 text-3xl font-black leading-[1.5] tracking-[-.025em]">سفارش تازه، فقط یک پیام فاصله دارد</h2>
            <p className="mt-4 leading-8 text-white/70">سفارش خود را از طریق واتساپ یا روبیکا ثبت کنید؛ ما در سریع‌ترین زمان پاسخ‌گو هستیم.</p>
            <address className="mt-8 space-y-5 not-italic">
              <ContactRow icon="phone" label="موبایل" value={site.mobileDisplay} href={contactLinks.phone} />
              <ContactRow icon="phone" label="تلفن" value={site.landlineDisplay} href={contactLinks.landline} />
              <ContactRow icon="instagram" label="اینستاگرام" value={site.instagramUsername} href={contactLinks.instagram} />
              <ContactRow icon="pin" label="آدرس فروشگاه" value={site.address} />
              <ContactRow icon="truck" label="محدوده ارسال" value={site.deliveryArea} />
            </address>
            <div className="mt-8 flex flex-wrap gap-3"><a href={whatsappOrderLink()} target="_blank" rel="noopener noreferrer" className="btn-primary"><Icon name="whatsapp" /> واتساپ</a><a href={contactLinks.rubika} target="_blank" rel="noopener noreferrer" className="btn-ghost"><Icon name="send" /> روبیکا</a></div>
          </div>
          <div className="m-3 flex min-h-[390px] flex-col gap-3 rounded-[1.5rem] bg-[#eee9e2] p-3 text-[#181512] lg:min-h-full">
            <iframe
              title="موقعیت سرزمین گوشت در اندیشه، فاز ۳"
              src={contactLinks.mapEmbed}
              className="min-h-[310px] w-full flex-1 rounded-[1.1rem] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a href={contactLinks.map} target="_blank" rel="noopener noreferrer" className="animated-action flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d9342d] px-6 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#ed453e] hover:shadow-lg">
              <Icon name="pin" className="size-5" /> مشاهده مسیر
            </a>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </>
  );
}

function SectionHeading({ id, eyebrow, title, description }) { return <div className="mx-auto max-w-2xl text-center"><p className="section-eyebrow">{eyebrow}</p><h2 id={id} className="section-title">{title}</h2><p className="mt-3 text-sm leading-7 text-black/60 sm:text-base sm:leading-8">{description}</p></div>; }
function Feature({ icon, title, text }) { return <div className="group flex gap-3 rounded-2xl border border-black/6 bg-white p-4.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#dc3b3420] hover:shadow-md"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff0ed] text-[#c8322c] transition-colors duration-300 group-hover:bg-[#dc3b34] group-hover:text-white"><Icon name={icon} /></span><div><h3 className="font-extrabold leading-6">{title}</h3><p className="mt-1 text-xs leading-5 text-black/55">{text}</p></div></div>; }
function Review({ name, text, date, index }) { return <article data-reveal style={{ "--reveal-delay": `${index * 80}ms` }} className="rounded-[1.4rem] border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#dc3b3418] hover:shadow-[0_18px_45px_rgba(43,21,9,.08)] sm:p-7"><div className="flex items-center justify-between"><div aria-label="امتیاز ۵ از ۵" className="flex gap-1 text-[#b82b25]">★★★★★</div><span aria-hidden="true" className="text-5xl font-serif leading-none text-[#e24038]/15">“</span></div><p className="mt-4 min-h-24 text-sm leading-7 text-black/70">{text}</p><div className="mt-5 flex items-center gap-3 border-t border-black/8 pt-5"><span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-[#1d1916] text-sm font-bold text-white">{index + 1}</span><div><h3 className="text-sm font-extrabold">{name}</h3><p className="mt-1 text-xs text-black/60">{date}</p></div></div></article>; }
function ContactRow({ icon, label, value, href }) { const content = <><p className="text-xs text-white/60">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></>; return <div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/8 text-[#ee4a42]"><Icon name={icon} /></span>{href ? <a className="rounded-sm hover:text-[#ff756e]" href={href}>{content}</a> : <div>{content}</div>}</div>; }
function Footer() { return <footer className="border-t border-black/5 bg-[#fffaf5] px-5 py-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row"><div className="flex items-center gap-3"><span className="relative size-12 overflow-hidden rounded-2xl bg-white"><Image src="/images/logo.png" alt="" fill sizes="48px" className="object-cover" /></span><div><strong className="block text-lg">سرزمین گوشت</strong><span className="text-xs text-black/55">تازه، سالم، مطمئن</span></div></div><nav aria-label="پیوندهای پایین صفحه" className="flex flex-wrap justify-center gap-6 text-sm text-black/65"><a href="#home">خانه</a><a href="#products">محصولات</a><a href="#about">درباره ما</a><a href="#contact">تماس با ما</a></nav><div className="flex gap-2"><a href={whatsappOrderLink()} target="_blank" rel="noopener noreferrer" aria-label="واتساپ" className="social"><Icon name="whatsapp" /></a><a href={contactLinks.rubika} target="_blank" rel="noopener noreferrer" aria-label="روبیکا" className="social"><Icon name="send" /></a><a href={contactLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام" className="social"><Icon name="instagram" /></a></div></div><div className="mx-auto mt-8 max-w-7xl space-y-2 border-t border-black/6 pt-6 text-center text-xs text-black/50"><p>© ۱۴۰۵ سرزمین گوشت — تمامی حقوق محفوظ است.</p><p>طراحی و توسعه توسط <a href="https://t.me/Develop_ata" target="_blank" rel="noopener noreferrer" className="font-bold text-black/65 transition hover:text-[#b92b25] focus-visible:text-[#b92b25]" dir="ltr">@Develop_ata</a></p></div></footer>; }
