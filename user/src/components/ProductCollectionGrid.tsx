'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductCollectionGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const apiUrl = getApiUrl();
      try {
        const response = await fetch(`${apiUrl}/products?limit=6`);
        if (response.ok) {
          const resData = await response.json();
          if (resData && Array.isArray(resData.data)) {
            const mapped = resData.data.map((p: any) => {
              const firstVariant = p.variants?.[0];
              const sellingPrice = firstVariant?.offerPrice ? firstVariant.offerPrice : (firstVariant?.price || p.price || 5400);
              return {
                id: p.id,
                name: p.name,
                price: sellingPrice,
                image: p.image || "/prod_overshirt_1778670536589.png"
              };
            });
            setProducts(mapped);
          }
        }
      } catch (error) {
        console.error("Error fetching collection products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-sans font-extrabold text-stone-900 tracking-tight text-center mb-12">Our Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="aspect-square w-full bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-sans font-extrabold text-stone-900 tracking-tight text-center mb-12">Our Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16">
        {products.map((prod) => (
          <Link href={`/product?id=${prod.id}`} key={prod.id} className="group cursor-pointer block">
            <div className="relative aspect-square bg-[#E7F2FF] mb-4 overflow-hidden rounded-xl">
              <Image 
                src={prod.image} 
                alt={prod.name} 
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply p-4"
              />
            </div>
            <div className="flex flex-col gap-1 text-left pl-2">
              <h4 className="text-sm text-gray-900 group-hover:text-[#0077FF] transition-colors">{prod.name}</h4>
              <p className="text-sm font-semibold text-gray-950">₹ {prod.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
