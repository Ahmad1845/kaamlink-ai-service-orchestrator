/**
 * Kaamlink AI Service Orchestrator — Phase 1 & 2
 * 5-screen flow: Home → Pricing → Bids → Confirmed → Recovery
 * All 7 agents visible with live traces.
 */
import React, { useState } from 'react';
import HomeScreen from '../../screens/HomeScreen';
import PricingScreen from '../../screens/PricingScreen';
import BidsScreen from '../../screens/BidsScreen';
import ConfirmedScreen from '../../screens/ConfirmedScreen';
import RecoveryScreen from '../../screens/RecoveryScreen';
import ServicesScreen from '../../screens/ServicesScreen';
import RequestsScreen from '../../screens/RequestsScreen';

type Screen = 'home' | 'pricing' | 'bids' | 'confirmed' | 'recovery' | 'SERVICES' | 'REQUESTS';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [flowData, setFlowData] = useState<any>({});

  const go = (to: Screen, extra?: any) => {
    if (extra) setFlowData((prev: any) => ({ ...prev, ...extra }));
    setScreen(to);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'HOME') setScreen('home');
    if (tab === 'SERVICES') setScreen('SERVICES');
    if (tab === 'REQUESTS') setScreen('REQUESTS');
  };

  const restart = () => { setFlowData({}); setScreen('home'); };

  if (screen === 'home')
    return <HomeScreen onNext={d => go('pricing', d)} onTabChange={handleTabChange} activeTab="HOME" />;
  if (screen === 'pricing')
    return <PricingScreen data={flowData} onNext={d => go('bids', d)} onBack={() => setScreen('home')} />;
  if (screen === 'bids')
    return <BidsScreen data={flowData} onNext={d => go('confirmed', d)} onBack={() => setScreen('pricing')} />;
  if (screen === 'confirmed')
    return <ConfirmedScreen data={flowData} onSimulateCancel={(bookingId: string) => go('recovery', { bookingId })} onRestart={restart} />;
  if (screen === 'recovery')
    return <RecoveryScreen data={flowData} onRestart={restart} />;
  if (screen === 'SERVICES')
    return <ServicesScreen onTabChange={handleTabChange} activeTab="SERVICES" />;
  if (screen === 'REQUESTS')
    return <RequestsScreen bookingData={flowData} onTabChange={handleTabChange} activeTab="REQUESTS" />;

  return null;
}
