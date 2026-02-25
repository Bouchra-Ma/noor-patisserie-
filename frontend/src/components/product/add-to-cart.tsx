"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

type ProductAddToCartProps = {
  id: number;
  name: string;
  price: number;
};

export function ProductAddToCart({ id, name, price }: ProductAddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    // Double check: if not hydrated or not mounted, redirect to login
    if (!isMounted || !isHydrated || !user) {
      router.push('/login');
      return;
    }

    addItem({ id, name, price });
  };

  return (
    <Button
      size="lg"
      variant="primary"
      fullWidth
      onClick={handleClick}
    >
      Ajouter au panier
    </Button>
  );
}

