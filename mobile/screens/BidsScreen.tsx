import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { NavHeader, Avatar, AgentStepRow, PulsingDot, GlassCard, AnimatedPressable } from '../components/KaamilinkUI';

const PulsingText = ({ text, color }: { text: string; color: string }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.Text style={[s.expiryTxt, { color, opacity }]}>{text}</Animated.Text>;
};

export default function BidsScreen({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const { intent, providers, pricing, userBudget } = data;
  const [bids, setBids] = useState<any[]>([]);
  const [shown, setShown] = useState(0);
  const [secs, setSecs] = useState(120);
  const slideAnims = useRef([0, 1, 2].map(() => new Animated.Value(60))).current;
  const fadeAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    fetch(`${API_BASE}/api/bids`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providers, urgency: intent.urgency, user_budget: userBudget }) })
      .then(r => r.json()).then(d => {
        setBids(d.bids || []);
        [0, 1, 2].forEach(i => setTimeout(() => {
          setShown(prev => prev + 1);
          Animated.parallel([
            Animated.spring(slideAnims[i], { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
            Animated.timing(fadeAnims[i], { toValue: 1, duration: 400, useNativeDriver: true }),
          ]).start();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 1500 * (i + 1)));
      }).catch(() => {});
  }, []);

  useEffect(() => { const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <LinearGradient colors={['#0F1220', '#080B14']} style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavHeader title="Live Bids" onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        <GlassCard style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={s.liveRow}><PulsingDot color={C.green} /><Text style={s.liveTxt}> LIVE</Text></View>
          <Text style={s.timer}>{mm}:{ss}</Text>
        </GlassCard>

        <GlassCard style={{ backgroundColor: 'rgba(79, 110, 247, 0.1)', borderColor: C.blue + '33' }}>
          <Text style={s.contextService}>{intent.service} · {intent.location}</Text>
          <Text style={s.contextBudget}>Your offer: PKR {userBudget?.toLocaleString() || pricing?.suggested_offer?.toLocaleString() || 'open'}</Text>
        </GlassCard>

        <GlassCard>
          <AgentStepRow title="[6] RADIUS EXPANSION AGENT" desc={shown > 0 ? `${shown} bid${shown > 1 ? 's' : ''} received — expanding search if needed` : 'Contacting nearby providers...'} status={shown > 0 ? 'done' : 'running'} />
          <AgentStepRow title="[BID SIMULATION AGENT]" desc={shown >= 3 ? 'All bids ranked · Best Value identified' : `Waiting for bids... (${shown}/3)`} status={shown >= 3 ? 'done' : shown > 0 ? 'running' : 'waiting'} />
        </GlassCard>

        {shown === 0 && (
          <GlassCard style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <PulsingDot color={C.blue} /><Text style={s.waitTxt}>  Waiting for providers to respond...</Text>
          </GlassCard>
        )}

        {bids.slice(0, shown).map((bid, i) => {
          const content = (
            <View style={[s.bidCardInner, i === 0 && s.bidCardInnerTop]}>
              {i === 0 && shown >= 3 && <View style={s.bestBadge}><Ionicons name="trophy" size={11} color={C.amber} /><Text style={s.bestTxt}> BEST VALUE</Text></View>}
              <View style={s.bidHeader}>
                <Avatar name={bid.provider_name} color={i === 0 ? C.blue : C.purple} size={48} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.bidName}>{bid.provider_name}</Text>
                  <View style={s.etaChip}>
                    <Ionicons name="time" size={11} color={C.textMuted} />
                    <Text style={s.etaTxt}>{bid.eta_mins} min away</Text>
                  </View>
                </View>
              </View>
              <View style={s.divider} />
              <View style={s.priceRow}>
                <Text style={s.bidAmount}>PKR {bid.amount?.toLocaleString()}</Text>
                <PulsingText text="2 min left" color={C.amber} />
              </View>
              <AnimatedPressable style={[s.acceptBtn, i === 0 && s.acceptBtnPrimary]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNext({ ...data, selectedBid: bid }); }}>
                <Text style={s.acceptTxt}>{i === 0 ? '⚡ Accept Best Bid' : 'Accept Bid'}</Text>
              </AnimatedPressable>
            </View>
          );

          return (
            <Animated.View key={bid.id} style={[s.bidCardWrapper, { transform: [{ translateY: slideAnims[i] }], opacity: fadeAnims[i] }]}>
              {i === 0 ? (
                <LinearGradient colors={[C.blue, C.accent]} style={s.gradientBorder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  {content}
                </LinearGradient>
              ) : (
                <View style={s.solidBorder}>
                  {content}
                </View>
              )}
            </Animated.View>
          );
        })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveTxt: { color: C.green, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13, letterSpacing: 1 },
  timer: { color: C.text, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 },
  contextCard: { backgroundColor: C.blueGlow, borderRadius: 14, borderWidth: 1, borderColor: C.blue + '33', padding: 14, marginBottom: 12 },
  contextService: { color: C.blue, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
  contextBudget: { color: C.textSub, fontSize: 13, marginTop: 4, fontFamily: 'PlusJakartaSans_400Regular' },
  agentCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 16 },
  waitBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 16, borderWidth: 1, borderColor: C.border },
  waitTxt: { color: C.textSub, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  bidCardWrapper: { marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  gradientBorder: { padding: 1.5, borderRadius: 18 },
  solidBorder: { padding: 1, backgroundColor: C.border, borderRadius: 18 },
  bidCardInner: { backgroundColor: 'rgba(15, 18, 32, 0.9)', borderRadius: 17, padding: 16 },
  bidCardInnerTop: { backgroundColor: C.surfaceAlt },
  bestBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.amber + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.amber + '44', marginBottom: 12 },
  bestTxt: { color: C.amber, fontSize: 11, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.5 },
  bidHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bidName: { color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, marginBottom: 4 },
  etaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceAlt, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  etaTxt: { color: C.textMuted, fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold', marginLeft: 4 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  bidAmount: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24 },
  expiryTxt: { fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold' },
  acceptBtn: { backgroundColor: 'rgba(22, 25, 38, 0.8)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  acceptBtnPrimary: { backgroundColor: C.blue, borderColor: C.blue },
  acceptTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
});
