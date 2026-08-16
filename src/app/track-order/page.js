import Header from "@/components/Header";
import TrackOrderPage from "./TrackOrderPage";

export const metadata = {
  title: "پیگیری سفارش | سرزمین گوشت",
  description: "پیگیری امن وضعیت سفارش سرزمین گوشت با شماره سفارش و شماره موبایل.",
  robots: { index: false, follow: false },
};

export default function CustomerOrderTrackingPage() {
  return (
    <>
      <Header />
      <TrackOrderPage />
    </>
  );
}
