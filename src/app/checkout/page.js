import Header from "@/components/Header";
import CheckoutPage from "./CheckoutPage";

export const metadata = {
  title: "ثبت سفارش | سرزمین گوشت",
  description: "ثبت سفارش محصولات سرزمین گوشت و وارد کردن اطلاعات تحویل.",
  robots: { index: false, follow: false },
};

export default function CustomerCheckoutPage() {
  return (
    <>
      <Header />
      <CheckoutPage />
    </>
  );
}
