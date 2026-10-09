import CheckoutForm from "@/components/checkout-form";
import { PageBar } from "@/components/cart-view";
import PageBody from "@/components/page-body";

export const metadata = { title: "STAB · Checkout" };

export default function CheckoutPage() {
  return (
    <div>
      <PageBar title="Checkout" />
      <PageBody>
        <CheckoutForm />
      </PageBody>
    </div>
  );
}
