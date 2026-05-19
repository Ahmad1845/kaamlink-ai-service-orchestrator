import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { NavHeader, AgentStepRow, GlassCard, AnimatedPressable } from '../components/KaamilinkUI';

export default function PricingScreen({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const { intent, providers } = data;
  const [pricing, setPricing] = useState<any>(null);
  const [budget, setBudget] = useState('');
  const [prob, setProb] = useState<number | null>(null);
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    fetch(`${API_BASE}/api/pricing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: intent.service, complexity: intent.complexity || 'intermediate', urgency: intent.urgency, location: intent.location }),
    }).then(r => r.json()).then(setPricing).catch(() => {});
  }, []);

  const updateBudget = (val: string) => {
    setBudget(val);
    Haptics.selectionAsync();
    if (pricing && val) {
      const p = Math.min(95, Math.round((parseInt(val) / pricing.suggested_offer) * 100));
      setProb(isNaN(p) ? null : p);
      Animated.timing(barAnim, { toValue: isNaN(p) ? 0 : p / 100, duration: 300, useNativeDriver: false }).start();
    } else { setProb(null); barAnim.setValue(0); }
  };

  const probColor = prob !== null ? (prob >= 75 ? C.green : prob >= 50 ? C.amber : C.red) : C.blue;
  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const accepted = budget ? parseInt(budget) : pricing?.suggested_offer;
  const isBelowMin = budget && pricing && parseInt(budget) < pricing.market_min;

  const urgencyBg = intent.urgency === 'high' ? C.amberGlow : C.greenGlow;
  const urgencyBorder = intent.urgency === 'high' ? C.amber : C.green;
  const urgencyText = intent.urgency === 'high' ? C.amberDark : '#065F46';

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavHeader title="Fair Price Estimate ✨" onBack={onBack} />
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <GlassCard>
            <AgentStepRow
              title="PRICING AGENT"
              desc={pricing ? `Market rate computed for ${intent.service}` : 'Calculating market price...'}
              status={pricing ? 'done' : 'running'}
            />
          </GlassCard>

          {/* Service info row */}
          <View style={s.serviceRow}>
            <View style={[s.urgencyBadge, { backgroundColor: urgencyBg, borderColor: urgencyBorder }]}>
              <Ionicons name="flash" size={11} color={urgencyText} />
              <Text style={[s.urgencyTxt, { color: urgencyText }]}>
                {intent.urgency === 'high' ? 'High Urgency' : intent.urgency + ' urgency'}
              </Text>
            </View>
            <Text style={s.serviceName}>{intent.service}</Text>
            <View style={[s.complexityBadge]}>
              <Text style={s.complexityTxt}>{intent.complexity || 'intermediate'}</Text>
            </View>
          </View>

          {pricing ? (
            <>
              <GlassCard>
                <Text style={s.rangeLabel}>MARKET RANGE</Text>
                <Text style={s.rangeValue}>Rs. {pricing.market_min.toLocaleString()} – {pricing.market_max.toLocaleString()}</Text>
                <View style={s.factors}>
                  {pricing.factors?.map((f: string, i: number) => (
                    <View key={i} style={s.factorChip}><Text style={s.factorTxt}>• {f}</Text></View>
                  ))}
                </View>
              </GlassCard>

              <GlassCard style={{ borderColor: C.blue + '44', backgroundColor: C.blueGlow }}>
                <View style={s.aiRow}>
                  <Ionicons name="sparkles" size={13} color={C.blue} />
                  <Text style={s.aiLabel}> AI SUGGESTED OFFER</Text>
                </View>
                <Text style={s.suggestPrice}>Rs. {pricing.suggested_offer.toLocaleString()}</Text>
                <Text style={s.recommendation}>{pricing.recommendation}</Text>
              </GlassCard>

              <GlassCard>
                <Text style={s.budgetLabel}>Your Custom Budget (optional)</Text>
                <TextInput
                  style={s.budgetInput}
                  value={budget}
                  onChangeText={updateBudget}
                  keyboardType="numeric"
                  placeholder={`Suggested: ${pricing.suggested_offer}`}
                  placeholderTextColor={C.textMuted}
                />
                {isBelowMin ? (
                  <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: C.red + '22', padding: 10, borderRadius: 8 }}>
                    <Ionicons name="warning" size={14} color={C.red} />
                    <Text style={{ marginLeft: 6, color: C.red, fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                      Price cannot be below market minimum (Rs. {pricing.market_min.toLocaleString()})
                    </Text>
                  </View>
                ) : prob !== null && (
                  <View style={{ marginTop: 12 }}>
                    <View style={s.probTrack}>
                      <Animated.View style={[s.probFill, { width: barWidth }]}>
                        <LinearGradient colors={[C.red, C.amber, C.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                      </Animated.View>
                    </View>
                    <Text style={[s.probTxt, { color: probColor }]}>{prob}% acceptance probability</Text>
                  </View>
                )}
              </GlassCard>
            </>
          ) : (
            <GlassCard style={{ height: 100, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular' }}>Pricing Agent working...</Text>
            </GlassCard>
          )}

          <AnimatedPressable
            onPress={() => { 
              if (isBelowMin) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
              onNext({ ...data, pricing, userBudget: accepted }); 
            }}
            style={[s.btn, isBelowMin && { opacity: 0.5, backgroundColor: C.textMuted }]}
            disabled={!!isBelowMin}
          >
            <Text style={s.btnTxt}>{accepted ? `Accept Rs. ${accepted.toLocaleString()} →` : 'Continue →'}</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={s.btnGhost}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onNext({ ...data, pricing, userBudget: null }); }}
          >
            <Text style={s.btnGhostTxt}>Skip Pricing</Text>
          </AnimatedPressable>

        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  serviceName: { flex: 1, color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  urgencyTxt: { fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' },
  complexityBadge: { backgroundColor: C.purpleGlow, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.purple + '44' },
  complexityTxt: { color: C.purple, fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' },
  rangeLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.textMuted, letterSpacing: 1.5, marginBottom: 6 },
  rangeValue: { fontSize: 28, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 10 },
  factors: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  factorChip: { paddingVertical: 2 },
  factorTxt: { color: C.textSub, fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular' },
  aiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  aiLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, letterSpacing: 1 },
  suggestPrice: { fontSize: 30, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blueDark, marginBottom: 6 },
  recommendation: { fontSize: 13, color: C.textSub, lineHeight: 20, fontFamily: 'PlusJakartaSans_400Regular' },
  budgetLabel: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold', color: C.textSub, marginBottom: 10 },
  budgetInput: { backgroundColor: C.surfaceAlt, borderRadius: 12, padding: 14, color: C.text, fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', borderWidth: 1, borderColor: C.border },
  probTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  probFill: { height: 6, borderRadius: 3 },
  probTxt: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold' },
  btn: { backgroundColor: C.blue, borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 10 },
  btnTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16 },
  btnGhost: { borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  btnGhostTxt: { color: C.textSub, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15 },
});
