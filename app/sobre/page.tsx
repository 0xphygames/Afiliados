import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export const metadata = { title: 'Sobre a Achadinhos & Looks', description: 'Conheça a curadoria de compras da Achadinhos & Looks.' };

export default function SobrePage() {
  return <><Navbar /><main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-4xl font-bold">Sobre a Achadinhos & Looks</h1><p className="mt-6 leading-relaxed text-stone-700">A Achadinhos & Looks é uma curadoria independente de produtos, looks, cupons e guias de compra criada por Tamires Santos.</p><p className="mt-4 leading-relaxed text-stone-700">Os links podem participar de programas oficiais de afiliados. Os preços, condições e disponibilidade são definidos pelas lojas parceiras.</p><Link href="/contato" className="mt-8 inline-block font-semibold text-amber-700">Fale conosco →</Link></main><Footer /></>;
}
