import Header from "@/components/Header";
import CartPage from "./CartPage";

export const metadata = {
  title: "سبد خرید | سرزمین گوشت",
  description: "مشاهده و مدیریت سبد خرید محصولات سرزمین گوشت.",
};

export default function CustomerCartPage() {
  return (
    <>
      <Header />
      <CartPage />
    </>
  );
}
