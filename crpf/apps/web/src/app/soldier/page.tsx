import { SoldierDashboard } from '@/components/soldier/SoldierDashboard';
import { OrderSyncQueue } from '@/components/soldier/OrderSyncQueue';

export default function SoldierPage() {
  return (
    <>
      <OrderSyncQueue />
      <SoldierDashboard />
    </>
  );
}
