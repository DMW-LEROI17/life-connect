import type { Metadata } from 'next';
import Link from 'next/link';

import { EmergencyRequestForm } from '@/components/emergency/EmergencyRequestForm';
import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { Icon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getGeoTree } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Transport urgent : moto, taxi, véhicule',
  description:
    'Alertez les moto-taxis, taxis et véhicules proches pour un transport urgent au Cameroun.',
};

export default async function TransportPage() {
  const geo = await getGeoTree();

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/urgence"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Urgences
        </Link>

        <div className="mt-4 rounded-2xl bg-urgent-600 p-4 text-white">
          <h1 className="text-2xl font-black tracking-tight">
            Alerter les aideurs près de moi
          </h1>
          <p className="mt-1 text-sm text-white/85">
            Moto-taxi, taxi ou véhicule pour un transport urgent. Pour une
            urgence vitale, appelez d’abord le 119.
          </p>
          <div className="mt-3">
            <EmergencyNumbers compact />
          </div>
        </div>

        <div className="mt-6">
          <EmergencyRequestForm geo={geo} />
        </div>
      </main>

      <Footer />
    </>
  );
}
