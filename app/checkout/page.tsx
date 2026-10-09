import CheckoutForm from "@/components/checkout-form";
import { PageBar } from "@/components/cart-view";

export const metadata = { title: "STAB · Checkout" };

export default function CheckoutPage() {
  return (
    <div>
      <PageBar title="Checkout" />
      <CheckoutForm />
    </div>
  );
}
