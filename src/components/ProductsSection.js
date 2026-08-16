import ProductShowcase from "./ProductShowcase";
import { getProducts } from "@/lib/products";
import { connection } from "next/server";

export default async function ProductsSection() {
  // Establish request-time rendering before supabase-js performs its fetch.
  // Otherwise it catches Next's dynamic-render signal as if it were a query error.
  await connection();
  const { products, error } = await getProducts();

  return <ProductShowcase products={products} error={error} />;
}
