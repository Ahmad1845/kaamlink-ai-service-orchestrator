/**
 * Kaamlink AI Service Orchestrator — Phase 1 & 2
 * 5-screen flow: Home → Pricing → Bids → Confirmed → Recovery
 * All 7 agents visible with live traces.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
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
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  if (!appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Image source={require('../../assets/images/icon.png')} style={{ width: 80, height: 80 }} />
        <Text style={{ marginTop: 16, fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0A0A14' }}>
          Kaam<Text style={{ color: '#3D5AFE' }}>link</Text>
        </Text>
        <Text style={{ marginTop: 4, fontSize: 11, letterSpacing: 2, color: '#9097A6', fontFamily: 'PlusJakartaSans_600SemiBold' }}>
          AI SERVICE ORCHESTRATOR
        </Text>
      </View>
    );
  }

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
