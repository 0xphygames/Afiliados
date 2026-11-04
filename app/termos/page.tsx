import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export const metadata = { title: 'Termos e transparência', description: 'Termos, transparência de afiliados e privacidade da Achadinhos & Looks.' };

export default function TermosPage() {
  return <><Navbar /><main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-4xl font-bold">Termos e transparência</h1><h2 className="mt-8 text-xl font-bold">Links de afiliados</h2><p className="mt-3 leading-relaxed text-stone-700">A Achadinhos & Looks pode receber comissão quando uma compra é realizada por um link de afiliado, sem acréscimo obrigatório para o consumidor.</p><h2 className="mt-8 text-xl font-bold">Preços e disponibilidade</h2><p className="mt-3 leading-relaxed text-stone-700">Preços, cupons, estoque, entrega e condições pertencem às lojas parceiras e podem mudar sem aviso.</p><h2 className="mt-8 text-xl font-bold">Privacidade</h2><p className="mt-3 leading-relaxed text-stone-700">Ferramentas de análise podem ser usadas para melhorar o site conforme as preferências de consentimento apresentadas ao visitante.</p></main><Footer /></>;
}
