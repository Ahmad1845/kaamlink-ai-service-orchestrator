import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { Avatar, GlassCard, AnimatedPressable, NavHeader } from '../components/KaamilinkUI';

export default function RecoveryScreen({ data, onRestart }: { data: any; onRestart: () => void }) {
  const { selectedBid, bookingId } = data;
  const [steps, setSteps] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tick: any;
    let isMounted = true;

    fetch(`${API_BASE}/api/recover`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId || 'demo-booking' }),
    }).then(r => r.json()).then(d => {
      if (!isMounted) return;
      if (!d || !d.steps) { setLoading(false); return; }
      let i = 0;
      tick = setInterval(() => {
        if (i < d.steps.length) {
          const nextStep = d.steps[i];
          if (nextStep) setSteps(prev => [...prev, nextStep]);
          i++;
        } else { clearInterval(tick); setResult(d); setLoading(false); }
      }, 1400);
    }).catch(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; if (tick) clearInterval(tick); };
  }, []);

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavHeader title="Recovery Agent" />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Warning Banner */}
          <GlassCard style={{ backgroundColor: C.amberGlow, borderColor: C.amber + '66', alignItems: 'center', paddingVertical: 20 }}>
            <Ionicons name="warning" size={32} color={C.amber} style={{ marginBottom: 8 }} />
            <Text style={s.warnTitle}>Provider Cancelled</Text>
            <Text style={s.warnSub}>{selectedBid?.provider_name} cancelled unexpectedly.</Text>
            <Text style={s.warnSub}>Recovery Agent is finding a replacement...</Text>
          </GlassCard>

          {/* Recovery Trace */}
          <GlassCard style={{ borderColor: C.blue + '44' }}>
            <View style={s.traceHeader}>
              <Ionicons name="refresh-circle" size={16} color={C.blue} />
              <Text style={s.traceTitle}> RECOVERY AGENT — Live Trace</Text>
            </View>
            {steps.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepDot}>
                  <Ionicons name="checkmark" size={10} color={C.blue} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.stepMsg}>{step?.message || 'Processing...'}</Text>
                  {step?.detail ? <Text style={s.stepDetail}>{step.detail}</Text> : null}
                </View>
              </View>
            ))}
            {loading && (
              <View style={s.loadingRow}>
                <ActivityIndicator size="small" color={C.blue} />
                <Text style={s.loadingTxt}> Agent working...</Text>
              </View>
            )}
          </GlassCard>

          {/* Replacement Result */}
          {result?.success && result.replacement_provider && (
            <GlassCard style={{ backgroundColor: C.greenGlow, borderColor: C.green + '66' }}>
              <View style={s.successHeader}>
                <Ionicons name="checkmark-circle" size={22} color={C.green} />
                <Text style={s.successTitle}> Replacement Confirmed!</Text>
              </View>
              <View style={s.replacementRow}>
                <Avatar name={result.replacement_provider.name} color={C.green} size={48} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.replaceName}>{result.replacement_provider.name}</Text>
                  <View style={s.replaceEta}>
                    <Ionicons name="time-outline" size={13} color={C.green} />
                    <Text style={s.replaceEtaTxt}> {result.replacement_provider.eta_mins} min ETA</Text>
                  </View>
                  <Text style={s.replaceRating}>⭐ {result.replacement_provider.rating} rating</Text>
                </View>
              </View>
              <Text style={s.successMsg}>{result.message}</Text>
            </GlassCard>
          )}

          {!loading && (
            <AnimatedPressable
              style={s.restartBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onRestart(); }}
            >
              <Text style={s.restartTxt}>Start New Request →</Text>
            </AnimatedPressable>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  warnTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.amberDark, marginBottom: 4 },
  warnSub: { fontSize: 13, color: C.amberDark, fontFamily: 'PlusJakartaSans_400Regular', opacity: 0.8, textAlign: 'center' },
  traceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  traceTitle: { fontSize: 11, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, letterSpacing: 0.8 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.blueGlow, borderWidth: 1, borderColor: C.blue + '44', alignItems: 'center', justifyContent: 'center' },
  stepMsg: { fontSize: 13, color: C.text, fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 2 },
  stepDetail: { fontSize: 11, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  loadingTxt: { color: C.textMuted, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' },
  successHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  successTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: '#065F46' },
  replacementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  replaceName: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: C.text, marginBottom: 4 },
  replaceEta: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  replaceEtaTxt: { color: C.green, fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold' },
  replaceRating: { fontSize: 12, color: C.textSub, fontFamily: 'PlusJakartaSans_400Regular' },
  successMsg: { fontSize: 13, color: '#065F46', fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 20 },
  restartBtn: { backgroundColor: C.blue, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 4 },
  restartTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16 },
});
