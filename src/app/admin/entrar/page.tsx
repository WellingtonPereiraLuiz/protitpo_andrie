import type { Metadata } from 'next';
import { Login } from '@/admin/login';

export const metadata: Metadata = { title: 'Entrar' };

export default function EntrarPage() {
  return <Login />;
}
