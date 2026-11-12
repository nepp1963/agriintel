import { Analytics } from '@vercel/analytics/react';
import { IrrigationDashboard } from './1-irrigation/components/IrrigationDashboard';

export function App() {
  return (
    <main>
      <IrrigationDashboard />
      <Analytics />
    </main>
  );
}

export default App;
