import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">YiXun Data Interface</h1>
      <p className="mb-8 text-center">
        Access global trade data for products and companies.
      </p>

      <Link href="/search">Go to Search</Link>
      <Link href="/companies">Go to Companies</Link>
      <Link href="/products">Go to Products</Link>
    </div>
  );
}
