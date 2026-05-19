import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, StyleSheet, SafeAreaView, Animated, Platform, UIManager, Image, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { C, API_BASE, REASONINGS } from '../constants/kaamlink';
import { AgentStepRow, SectionHeader, GlassCard, AnimatedPressable, PulsingDot } from '../components/KaamilinkUI';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Generate a fake but realistic session ID
const SESSION_ID = `REQ-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1 + Math.random() * 9)}`;

const SMOOTH_ANIM = {
  duration: 1200,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.spring, springDamping: 0.75 },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

export default function HomeScreen({ onNext, onTabChange, activeTab = 'HOME' }: { onNext: (data: any) => void; onTabChange?: (tab: string) => void; activeTab?: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<any>(null);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);
  useEffect(() => {
    if (loading) Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 1500, useNativeDriver: true })).start();
    else spinAnim.setValue(0);
  }, [loading]);
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true); setIntent(null);
    LayoutAnimation.configureNext(SMOOTH_ANIM);
    setStep(1);
    try {
      const r1 = await fetch(`${API_BASE}/api/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const intentData = await r1.json();
      if (!r1.ok) throw new Error(typeof intentData.detail === 'string' ? intentData.detail : JSON.stringify(intentData.detail) || 'Intent API Failed');

      if (intentData.service === 'invalid') {
        alert('Please describe a home service need.');
        LayoutAnimation.configureNext(SMOOTH_ANIM);
        setStep(0);
        setLoading(false);
        return;
      }
      setIntent(intentData); setStep(2);

      const r2 = await fetch(`${API_BASE}/api/providers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(intentData) });
      const rawProviders = await r2.json();
      if (!r2.ok) throw new Error(typeof rawProviders.detail === 'string' ? rawProviders.detail : JSON.stringify(rawProviders.detail) || 'Providers API Failed');

      setStep(3); await new Promise(r => setTimeout(r, 700)); setStep(4);
      const providers = rawProviders.map((p: any, i: number) => {
        const d = Number(p.distance_km) || ((i + 1) * 0.9);

        // Generate dynamic AI insight based on the actual service requested
        const srv = intentData.service.toLowerCase();
        let dynamicReasoning = '';
        if (i === 0) {
          dynamicReasoning = `Highest ranked for ${srv} in your area. Excellent response time and reliability score.`;
        } else if (i === 1) {
          dynamicReasoning = `Highly rated for transparent pricing and quality ${srv} services nearby.`;
        } else {
          dynamicReasoning = `Experienced team for complex ${srv} jobs with a solid track record.`;
        }

        return {
          ...p,
          distance: d.toFixed(1) + 'km',
          eta: Math.round(d * 8 + 5) + ' mins',
          reasoning: dynamicReasoning,
        };
      });
      onNext({ intent: intentData, providers });
    } catch (e: any) {
      alert('Failed: ' + e.message);
      LayoutAnimation.configureNext(SMOOTH_ANIM);
      setStep(0);
    }
    setLoading(false);
  };

  const getStep = (n: number): 'done' | 'running' | 'waiting' => step > n ? 'done' : step === n ? 'running' : 'waiting';

  // Urgency chip — amber for high, green for low
  const urgencyStyle = intent?.urgency === 'high'
    ? { bg: C.amberGlow, border: C.amber, text: C.amberDark }
    : intent?.urgency === 'medium'
      ? { bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C' }
      : { bg: C.greenGlow, border: C.green, text: '#065F46' };

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.logoRow}>
              <Image source={require('../assets/images/icon.png')} style={{ width: 36, height: 36, borderRadius: 8 }} />
              <Text style={s.brand}>Kaamlink</Text>
            </View>
            <View style={s.agentsBadge}>
              <PulsingDot color={C.blue} size={6} />
              <Text style={s.agentsText}>9 Agents Active</Text>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {step === 0 && <View style={{ height: 160 }} />}
            <Text style={s.heading}>What do you need done?</Text>
            <Text style={s.subheading}>Roman Urdu, Urdu, or English — we understand all</Text>

            {/* Input Card */}
            <GlassCard style={{ paddingBottom: 52 }}>
              <TextInput
                style={s.input}
                value={text}
                onChangeText={setText}
                multiline
                placeholder="e.g. AC bilkul thanda nahi kar raha, G-13 mein urgent chahiye"
                placeholderTextColor={C.textMuted}
              />
              <AnimatedPressable style={[s.sendBtn, loading && { opacity: 0.8 }]} onPress={handleSubmit} disabled={loading}>
                {loading
                  ? <Animated.Image source={require('../assets/images/icon.png')} style={{ width: 18, height: 18, borderRadius: 4, transform: [{ rotate: spin }] }} />
                  : <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
                }
              </AnimatedPressable>
            </GlassCard>

            {/* Intent Chips */}
            {intent && (
              <GlassCard>
                <SectionHeader icon="git-network-outline" label="INTENT EXTRACTION" />
                <Text style={s.intentDesc}>
                  Parsed from Roman Urdu request. Aligning with local service taxonomy.
                </Text>
                <View style={s.chips}>
                  <View style={s.chip}><Ionicons name="build" size={11} color={C.textMuted} /><Text style={s.chipTxt}>{intent.service}</Text></View>
                  <View style={s.chip}><Ionicons name="location" size={11} color={C.textMuted} /><Text style={s.chipTxt}>{intent.location}</Text></View>
                  <View style={s.chip}><Ionicons name="time" size={11} color={C.textMuted} /><Text style={s.chipTxt}>{intent.preferred_time}</Text></View>
                  <View style={[s.chip, { backgroundColor: urgencyStyle.bg, borderColor: urgencyStyle.border }]}>
                    <Ionicons name="flash" size={11} color={urgencyStyle.text} />
                    <Text style={[s.chipTxt, { color: urgencyStyle.text }]}>
                      {intent.urgency === 'high' ? 'High Urgency' : intent.urgency}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            )}

            {/* Agent Trace Console */}
            {step > 0 && (
              <GlassCard>
                <View style={s.traceHeaderRow}>
                  <SectionHeader icon="server-outline" label="Agent Trace Console" />
                  <Text style={s.sessionId}>{SESSION_ID}</Text>
                </View>
                {/* Step 1: Intent → fires when user submits */}
                <AgentStepRow
                  title="INTENT AGENT"
                  desc={intent ? `Extracted ${intent.service} · ${intent.location} · ${intent.urgency} urgency` : 'Awaiting input...'}
                  status={getStep(1)}
                />
                {/* Step 2: Radius + Discovery → fire during provider search */}
                <AgentStepRow
                  title="RADIUS AGENT"
                  desc={step > 2 ? 'Providers found within target radius' : step === 2 ? 'Expanding search radius to find providers...' : 'Will geo-fence provider search by location radius.'}
                  status={getStep(2)}
                />
                <AgentStepRow
                  title="DISCOVERY AGENT"
                  desc={step > 2 ? 'Providers scanned · top matches identified' : step === 2 ? 'Scanning available providers in target sector...' : 'Pending'}
                  status={getStep(2)}
                />
                {/* Step 3: Ranking → fires after providers found */}
                <AgentStepRow
                  title="RANKING AGENT"
                  desc={step > 3 ? 'Best value identified · ranked by proximity · rating · reliability' : step === 3 ? 'Ranking candidates by score...' : 'Awaiting provider list to rank.'}
                  status={getStep(3)}
                />
                {/* Steps 5-8: activate on later screens — shown as waiting here */}
                <AgentStepRow
                  title="PRICING AGENT"
                  desc="Will compute market-fair pricing based on service, urgency, and location."
                  status="waiting"
                />
                <AgentStepRow
                  title="SCHEDULING AGENT"
                  desc="Will validate and assign optimal time slot for dispatch."
                  status="waiting"
                />
                <AgentStepRow
                  title="BOOKING AGENT"
                  desc="Ready to confirm job and dispatch provider details."
                  status="waiting"
                />
                <AgentStepRow
                  title="NOTIFICATION AGENT"
                  desc="Standby for in-app, SMS, and WhatsApp alerts in Roman Urdu."
                  status="waiting"
                />
                {/* Recovery always on standby */}
                <AgentStepRow
                  title="RECOVERY AGENT"
                  desc="Standby — monitoring booking health"
                  status="waiting"
                  isLast={true}
                />
              </GlassCard>
            )}
          </ScrollView>

          {/* Tab Bar */}
          <View style={s.tabs}>
            {([
              ['grid', 'HOME'],
              ['compass-outline', 'SERVICES'],
              ['chatbubble-outline', 'REQUESTS'],
              ['person-outline', 'ACCOUNT'],
            ] as const).map(([icon, label]) => {
              const active = activeTab === label;
              return (
                <AnimatedPressable key={label} style={s.tab} onPress={() => onTabChange?.(label)}>
                  <Ionicons name={icon as any} size={20} color={active ? C.blue : C.textMuted} />
                  <Text style={[s.tabLabel, active && { color: C.blue }]}>{label}</Text>
                  {active && <View style={s.tabIndicator} />}
                </AnimatedPressable>
              );
            })}
          </View>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.blueGlow, borderWidth: 1.5, borderColor: C.blue + '33', alignItems: 'center', justifyContent: 'center' },
  logoK: { color: C.blue, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 },
  brand: { color: C.text, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, marginLeft: 10 },
  brandSub: { color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10 },
  agentsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.blue, backgroundColor: C.blueGlow },
  agentsText: { color: C.blue, fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold' },
  heading: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 4 },
  subheading: { fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: C.textMuted, marginBottom: 16 },
  input: { color: C.text, fontSize: 15, fontFamily: 'PlusJakartaSans_500Medium', minHeight: 80, textAlignVertical: 'top', lineHeight: 24 },
  sendBtn: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, borderRadius: 24, width: 44, height: 44 },
  sendTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
  intentDesc: { fontSize: 12, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', marginBottom: 12, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceAlt },
  chipTxt: { fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color: C.textSub },
  traceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sessionId: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.blue, backgroundColor: C.blueGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: C.textMuted, letterSpacing: 0.5 },
  tabIndicator: { position: 'absolute', bottom: -8, width: 20, height: 2, backgroundColor: C.blue, borderRadius: 1 },
});
