import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { NavHeader, Avatar, AgentStepRow, GlassCard, AnimatedPressable } from '../components/KaamilinkUI';

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
  const slideAnims = useRef([0, 1, 2].map(() => new Animated.Value(40))).current;
  const fadeAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    fetch(`${API_BASE}/api/bids`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providers, urgency: intent.urgency, user_budget: userBudget }),
    }).then(r => r.json()).then(d => {
      setBids(d.bids || []);
      [0, 1, 2].forEach(i => setTimeout(() => {
        setShown(prev => prev + 1);
        Animated.parallel([
          Animated.spring(slideAnims[i], { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
          Animated.timing(fadeAnims[i], { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 1400 * (i + 1)));
    }).catch(() => {});
  }, []);

  useEffect(() => { const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavHeader title="Top Recommendations" onBack={onBack} />

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Subtitle */}
          {intent && (
            <Text style={s.subtitle}>
              Found {Math.max(shown, 0)} providers in {intent.location} who match your {intent.urgency === 'high' ? 'high-urgency ' : ''}{intent.service} request.
            </Text>
          )}

          {/* Timer + Agent status */}
          <GlassCard style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={s.liveRow}>
              <View style={s.liveDot} />
              <Text style={s.liveTxt}>LIVE BIDS</Text>
            </View>
            <View style={s.timerWrap}>
              <Ionicons name="time-outline" size={13} color={C.textMuted} />
              <Text style={s.timer}>{mm}:{ss}</Text>
            </View>
          </GlassCard>

          <GlassCard>
            <AgentStepRow
              title="RADIUS AGENT"
              desc={shown > 0 ? `${shown} provider${shown > 1 ? 's' : ''} found — expanding if needed` : 'Contacting nearby providers...'}
              status={shown > 0 ? 'done' : 'running'}
            />
            <AgentStepRow
              title="BID SIMULATION AGENT"
              desc={shown >= 3 ? 'All bids ranked · Best Value identified' : `Waiting for bids... (${shown}/3)`}
              status={shown >= 3 ? 'done' : shown > 0 ? 'running' : 'waiting'}
              isLast={true}
            />
          </GlassCard>

          {shown === 0 && (
            <GlassCard style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Text style={s.waitTxt}>Waiting for providers to respond...</Text>
            </GlassCard>
          )}

          {/* Provider Cards */}
          {bids.slice(0, shown).map((bid, i) => {
            const provider = providers?.[i] || {};
            const reasoning = provider.reasoning || '';
            const isBest = i === 0 && shown >= 3;

            return (
              <Animated.View
                key={bid.id}
                style={[s.cardWrapper, { transform: [{ translateY: slideAnims[i] }], opacity: fadeAnims[i] }]}
              >
                <View style={[s.providerCard, isBest && s.providerCardBest]}>
                  {/* Best Badge */}
                  {isBest && (
                    <View style={s.bestBadge}>
                      <Ionicons name="trophy" size={11} color={C.amber} />
                      <Text style={s.bestTxt}> BEST VALUE</Text>
                    </View>
                  )}

                  {/* Provider Info */}
                  <View style={s.provRow}>
                    <Avatar name={bid.provider_name} color={i === 0 ? C.blue : i === 1 ? C.green : C.purple} size={48} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.provName}>{bid.provider_name}</Text>
                      <View style={s.starRow}>
                        {[1,2,3,4,5].map(n => (
                          <Ionicons key={n} name={n <= Math.round(provider.rating || 4.5) ? 'star' : 'star-outline'} size={11} color={C.amber} />
                        ))}
                        <Text style={s.ratingTxt}> {provider.rating || '4.8'} ({Math.floor(80 + (provider.rating || 4.8) * 15 + i * 47)} reviews)</Text>
                      </View>
                    </View>
                    <View style={s.settingsIcon}>
                      <Ionicons name="settings-outline" size={16} color={C.textMuted} />
                    </View>
                  </View>

                  {/* AI INSIGHT Badge */}
                  {reasoning ? (
                    <View style={s.insightBox}>
                      <View style={s.insightBadge}>
                        <Ionicons name="sparkles" size={10} color={C.purple} />
                        <Text style={s.insightBadgeTxt}> AI INSIGHT</Text>
                      </View>
                      <Text style={s.insightTxt}>{reasoning}</Text>
                    </View>
                  ) : null}

                  {/* ETA / Distance / Price row */}
                  <View style={s.metaRow}>
                    <View style={s.metaItem}>
                      <Ionicons name="time-outline" size={12} color={C.textMuted} />
                      <Text style={s.metaTxt}> {bid.eta_mins} mins</Text>
                    </View>
                    <Text style={s.metaDot}>·</Text>
                    <View style={s.metaItem}>
                      <Ionicons name="location-outline" size={12} color={C.textMuted} />
                      <Text style={s.metaTxt}> {provider.distance || `${(i * 1.2 + 1.5).toFixed(1)} km`}</Text>
                    </View>
                    <Text style={s.metaDot}>·</Text>
                    <View style={s.metaItem}>
                      <Text style={s.metaPrice}>Rs. {Math.floor(bid.amount * 0.9).toLocaleString()} – {Math.floor(bid.amount * 1.1).toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Accept Button */}
                  <AnimatedPressable
                    style={[s.acceptBtn, isBest && s.acceptBtnPrimary]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNext({ ...data, selectedBid: bid }); }}
                  >
                    <Text style={[s.acceptTxt, !isBest && { color: C.blue }]}>
                      {isBest ? 'Select & Book ⚡' : 'Select & Book'}
                    </Text>
                  </AnimatedPressable>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  subtitle: { fontSize: 13, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', marginBottom: 12, lineHeight: 20 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  liveTxt: { color: C.green, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12, letterSpacing: 0.8 },
  timerWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timer: { color: C.text, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 },
  waitTxt: { color: C.textMuted, fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
  cardWrapper: { marginBottom: 12 },
  providerCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  providerCardBest: { borderColor: C.blue + '66', borderWidth: 1.5 },
  bestBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.amberGlow, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.amber + '66', marginBottom: 12 },
  bestTxt: { color: C.amberDark, fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  provRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  provName: { color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, marginBottom: 4 },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  ratingTxt: { color: C.textMuted, fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' },
  settingsIcon: { padding: 4 },
  insightBox: { backgroundColor: C.purpleGlow, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.purple + '33' },
  insightBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  insightBadgeTxt: { fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.purple, letterSpacing: 1 },
  insightTxt: { fontSize: 12, color: C.purpleDark, fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaDot: { color: C.textMuted, marginHorizontal: 2 },
  metaTxt: { color: C.textMuted, fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium' },
  metaPrice: { color: C.textSub, fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold' },
  expiryTxt: { fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold' },
  acceptBtn: { backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.blue },
  acceptBtnPrimary: { backgroundColor: C.blue, borderColor: C.blue },
  acceptTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
});
