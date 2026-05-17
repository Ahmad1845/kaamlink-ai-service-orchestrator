import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { NavHeader, AgentStepRow } from '../components/KaamilinkUI';

export default function PricingScreen({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const { intent, providers } = data;
  const [pricing, setPricing] = useState<any>(null);
  const [budget, setBudget] = useState('');
  const [prob, setProb] = useState<number | null>(null);
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    fetch(`${API_BASE}/api/pricing`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: intent.service, complexity: intent.complexity || 'intermediate', urgency: intent.urgency, location: intent.location }) })
      .then(r => r.json()).then(setPricing).catch(() => {});
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

  return (
    <LinearGradient colors={['#0F1220', '#080B14']} style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavHeader title="✨ Fair Price Estimate" onBack={onBack} />
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        <View style={s.agentCard}>
          <AgentStepRow title="[5] PRICING AGENT" desc={pricing ? `Market rate computed for ${intent.service}` : 'Calculating market price...'} status={pricing ? 'done' : 'running'} />
        </View>

        <View style={s.serviceRow}>
          <View style={s.complexityBadge}><Text style={s.complexityTxt}>{intent.complexity || 'intermediate'}</Text></View>
          <Text style={s.serviceName}>{intent.service}</Text>
          <View style={[s.urgencyBadge, intent.urgency === 'high' && { backgroundColor: C.red + '22', borderColor: C.red + '44' }]}>
            <Text style={[s.urgencyTxt, intent.urgency === 'high' && { color: C.red }]}>{intent.urgency} urgency</Text>
          </View>
        </View>

        {pricing ? (
          <>
            <View style={s.rangeCard}>
              <Text style={s.rangeLabel}>MARKET RANGE</Text>
              <Text style={s.rangeValue}>PKR {pricing.market_min.toLocaleString()} – {pricing.market_max.toLocaleString()}</Text>
              <View style={s.factors}>{pricing.factors?.map((f: string, i: number) => <View key={i} style={s.factorChip}><Text style={s.factorTxt}>• {f}</Text></View>)}</View>
            </View>

            <View style={s.suggestCard}>
              <View style={s.aiRow}><Ionicons name="sparkles" size={14} color={C.blue} /><Text style={s.aiLabel}> AI SUGGESTED OFFER</Text></View>
              <Text style={s.suggestPrice}>PKR {pricing.suggested_offer.toLocaleString()}</Text>
              <Text style={s.recommendation}>{pricing.recommendation}</Text>
            </View>

            <View style={s.budgetCard}>
              <Text style={s.budgetLabel}>Custom Budget (optional)</Text>
              <TextInput style={s.budgetInput} value={budget} onChangeText={updateBudget} keyboardType="numeric" placeholder={`${pricing.suggested_offer}`} placeholderTextColor={C.textMuted} />
              {prob !== null && (
                <View style={{ marginTop: 10 }}>
                  <View style={s.probTrack}>
                    <Animated.View style={[s.probFill, { width: barWidth }]}>
                      <LinearGradient colors={[C.red, C.amber, C.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                    </Animated.View>
                  </View>
                  <Text style={[s.probTxt, { color: probColor }]}>{prob}% acceptance probability</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={s.loadingCard}><Text style={{ color: C.textSub }}>Pricing Agent working...</Text></View>
        )}

        <TouchableOpacity style={s.btn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNext({ ...data, pricing, userBudget: accepted }); }}>
          <Text style={s.btnTxt}>{accepted ? `Accept PKR ${accepted.toLocaleString()} →` : 'Continue →'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGhost} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onNext({ ...data, pricing, userBudget: null }); }}>
          <Text style={s.btnGhostTxt}>Skip Pricing</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  agentCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  serviceName: { flex: 1, color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
  complexityBadge: { backgroundColor: C.purple + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.purple + '44' },
  complexityTxt: { color: C.purple, fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' },
  urgencyBadge: { backgroundColor: C.amber + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.amber + '44' },
  urgencyTxt: { color: C.amber, fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' },
  rangeCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 14 },
  rangeLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.accent, letterSpacing: 1.2, marginBottom: 6 },
  rangeValue: { fontSize: 36, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 12 },
  factors: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  factorChip: { paddingHorizontal: 4, paddingVertical: 2 },
  factorTxt: { color: C.textSub, fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular' },
  suggestCard: { backgroundColor: C.blueGlow, borderRadius: 16, borderWidth: 1, borderColor: C.blue + '44', padding: 18, marginBottom: 14 },
  aiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  aiLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, letterSpacing: 1 },
  suggestPrice: { fontSize: 32, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, marginBottom: 8 },
  recommendation: { fontSize: 13, color: C.textSub, lineHeight: 20, fontFamily: 'PlusJakartaSans_400Regular' },
  budgetCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 20 },
  budgetLabel: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold', color: C.textSub, marginBottom: 10 },
  budgetInput: { backgroundColor: 'rgba(22, 25, 38, 0.8)', borderRadius: 12, padding: 14, color: C.text, fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold', borderWidth: 1, borderColor: C.border },
  probTrack: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  probFill: { height: 8, borderRadius: 4 },
  probTxt: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' },
  loadingCard: { height: 100, backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: C.border },
  btn: { backgroundColor: C.blue, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12 },
  btnTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16 },
  btnGhost: { borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  btnGhostTxt: { color: C.textSub, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15 },
});
