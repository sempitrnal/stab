import CartView from "@/components/cart-view";

export const metadata = {
  title: "STAB · Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
