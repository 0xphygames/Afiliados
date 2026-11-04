import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export const metadata = { title: 'Contato', description: 'Entre em contato com a Achadinhos & Looks.' };

export default function ContatoPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@achadinhoselooks.com.br';
  const phone = process.env.NEXT_PUBLIC_BUSINESS_TELEPHONE;
  return <><Navbar /><main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-4xl font-bold">Contato</h1><p className="mt-6 leading-relaxed text-stone-700">Para dúvidas, sugestões, correções ou parcerias:</p><div className="mt-6 space-y-3"><a className="block font-semibold text-amber-700" href={`mailto:${email}`}>{email}</a>{phone && <a className="block font-semibold text-amber-700" href={`tel:${phone}`}>{phone}</a>}</div><Link href="/termos" className="mt-8 inline-block text-stone-600 underline">Termos e transparência</Link></main><Footer /></>;
}
