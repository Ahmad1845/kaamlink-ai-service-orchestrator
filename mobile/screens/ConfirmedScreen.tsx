import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { Avatar, AgentStepRow, GlassCard, AnimatedPressable, NavHeader } from '../components/KaamilinkUI';

const TIMELINE = [
  { label: 'Booking Confirmed',    urdu: 'Booking confirm ho gayi ✅',  color: C.green },
  { label: 'Provider Dispatched',  urdu: 'Provider nikal chuka hai 🚗', color: C.blue },
  { label: 'En Route',             urdu: 'Raste mein hai...',           color: C.blue },
  { label: 'Arrived',              urdu: 'Pahounch gaya! 📍',           color: C.purple },
  { label: 'Job Complete',         urdu: 'Kaam ho gaya! ⭐',            color: C.amber },
];

export default function ConfirmedScreen({ data, onRestart, onSimulateCancel }: { data: any; onRestart: () => void; onSimulateCancel: () => void }) {
  const { intent, selectedBid, pricing, userBudget } = data;
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [tlStep, setTlStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Book via API
    fetch(`${API_BASE}/api/book`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: selectedBid.provider_id, user_id: 'demo_user', service: intent.service, amount: selectedBid.amount }),
    }).then(r => r.json()).then(d => setBookingId(d.booking_id)).catch(() => setBookingId('local-' + Date.now()));

    // Animate timeline
    let step = 1;
    const t = setInterval(() => { if (step < TIMELINE.length) { setTlStep(++step); } else clearInterval(t); }, 3000);
    return () => clearInterval(t);
  }, []);

  const isHigh = intent?.urgency === 'high';
  const base = selectedBid?.amount || pricing?.suggested_offer || 1500;
  const emergency = isHigh ? Math.round(base * 0.35) : 0;
  const platform = Math.round(base * 0.035);
  const total = base + emergency + platform;

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavHeader title="Booking Confirmed" />
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Confirmation Hero */}
          <GlassCard style={{ alignItems: 'center', paddingVertical: 24, borderColor: C.green + '44', borderWidth: 1.5 }}>
            <View style={s.checkCircle}>
              <Ionicons name="checkmark-circle" size={52} color={C.green} />
            </View>
            <Text style={s.heroTitle}>Booking Confirmed!</Text>
            <Text style={s.heroSub}>{selectedBid.provider_name} aapki taraf aa rahe hain</Text>
            <View style={s.refRow}>
              <Ionicons name="receipt-outline" size={12} color={C.textMuted} />
              <Text style={s.refTxt}> #{bookingId?.slice(0, 8).toUpperCase() || '...'}</Text>
            </View>
          </GlassCard>

          {/* Provider Card */}
          <GlassCard>
            <View style={s.provRow}>
              <Avatar name={selectedBid.provider_name} color={C.blue} size={52} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.provName}>{selectedBid.provider_name}</Text>
                <View style={s.etaRow}>
                  <Ionicons name="time-outline" size={13} color={C.green} />
                  <Text style={s.etaTxt}> EST. ARRIVAL</Text>
                </View>
              </View>
              <View style={s.etaBig}>
                <Text style={s.etaNum}>{selectedBid.eta_mins}</Text>
                <Text style={s.etaMin}>min</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={s.actionRow}>
              <AnimatedPressable style={s.trackBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Ionicons name="navigate" size={14} color="#fff" />
                <Text style={s.trackTxt}> Track Live</Text>
              </AnimatedPressable>
              <AnimatedPressable style={s.callBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Ionicons name="call-outline" size={14} color={C.blue} />
                <Text style={s.callTxt}> Call {selectedBid.provider_name.split(' ')[0]}</Text>
              </AnimatedPressable>
            </View>

            <View style={s.divider} />
            <View style={s.infoRow}><Text style={s.infoLabel}>Service Type</Text><Text style={s.infoVal}>{intent.service}{isHigh ? ' (Emergency)' : ''}</Text></View>
            <View style={s.infoRow}><Text style={s.infoLabel}>Location</Text><Text style={s.infoVal}>{intent.location}</Text></View>
          </GlassCard>

          {/* Payment Summary */}
          <GlassCard>
            <View style={s.payHeader}>
              <Ionicons name="card-outline" size={16} color={C.text} />
              <Text style={s.payTitle}> Payment Summary</Text>
            </View>
            <View style={s.divider} />
            <View style={s.rRow}><Text style={s.rItem}>Base Service Charge</Text><Text style={s.rAmt}>Rs. {base.toLocaleString()}</Text></View>
            {isHigh && <View style={s.rRow}><Text style={s.rItem}>Emergency Priority Fee <Ionicons name="flash" size={11} color={C.red} /></Text><Text style={[s.rAmt, { color: C.red }]}>Rs. {emergency.toLocaleString()}</Text></View>}
            <View style={s.rRow}><Text style={s.rItem}>Platform Fee</Text><Text style={s.rAmt}>Rs. {platform.toLocaleString()}</Text></View>
            <View style={[s.rRow, s.rTotalRow]}>
              <Text style={s.rTotalLabel}>Total Amount</Text>
              <Text style={s.rTotalAmt}>Rs. {total.toLocaleString()}</Text>
            </View>
            <Text style={s.cashNote}>Cash on completion</Text>
          </GlassCard>

          {/* Timeline */}
          <GlassCard>
            <Text style={s.sectionTitle}>Service Timeline</Text>
            {TIMELINE.map((item, i) => {
              const done = i < tlStep;
              const active = i === tlStep - 1;
              return (
                <View key={i} style={s.tlRow}>
                  <View style={{ alignItems: 'center', marginRight: 12 }}>
                    <View style={[s.tlDot, { backgroundColor: done ? item.color : C.border }, active && { borderWidth: 2, borderColor: item.color, backgroundColor: item.color + '22' }]}>
                      {done && !active && <Ionicons name="checkmark" size={12} color="#fff" />}
                      {active && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />}
                    </View>
                    {i < TIMELINE.length - 1 && <View style={[s.tlLine, { backgroundColor: done ? item.color : C.border }]} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 20 }}>
                    <Text style={[s.tlLabel, { color: done ? C.text : C.textMuted }]}>{item.label}</Text>
                    {done && <Text style={[s.tlUrdu, { color: active ? item.color : C.textMuted }]}>{item.urdu}</Text>}
                  </View>
                  {done && !active && <Ionicons name="checkmark-circle" size={16} color={item.color} />}
                </View>
              );
            })}
          </GlassCard>

          {/* Agent row */}
          <GlassCard>
            <AgentStepRow
              title="BOOKING AGENT"
              desc={`Booking ${bookingId?.slice(0, 8) || '...'} confirmed and logged`}
              status={bookingId ? 'done' : 'running'}
            />
          </GlassCard>

          <AnimatedPressable style={s.cancelBtn} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onSimulateCancel(); }}>
            <Ionicons name="warning-outline" size={15} color={C.amber} />
            <Text style={s.cancelTxt}> Simulate Provider Cancellation</Text>
          </AnimatedPressable>

          <AnimatedPressable style={s.restartBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRestart(); }}>
            <Text style={s.restartTxt}>New Request</Text>
          </AnimatedPressable>

        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  checkCircle: { marginBottom: 12 },
  heroTitle: { fontSize: 22, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 4 },
  heroSub: { fontSize: 13, color: C.textSub, fontFamily: 'PlusJakartaSans_400Regular', marginBottom: 10 },
  refRow: { flexDirection: 'row', alignItems: 'center' },
  refTxt: { color: C.textMuted, fontFamily: 'JetBrainsMono_400Regular', fontSize: 11 },
  provRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  provName: { color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, marginBottom: 4 },
  etaRow: { flexDirection: 'row', alignItems: 'center' },
  etaTxt: { color: C.textMuted, fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 0.5 },
  etaBig: { alignItems: 'center' },
  etaNum: { fontSize: 32, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, lineHeight: 36 },
  etaMin: { fontSize: 11, color: C.textMuted, fontFamily: 'PlusJakartaSans_600SemiBold' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  trackBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, borderRadius: 12, padding: 13 },
  trackTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blueGlow, borderRadius: 12, padding: 13, borderWidth: 1.5, borderColor: C.blue },
  callTxt: { color: C.blue, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: C.textMuted, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' },
  infoVal: { color: C.text, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },
  payHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  payTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: C.text },
  rRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rItem: { color: C.textSub, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', flex: 1 },
  rAmt: { color: C.text, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },
  rTotalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 4, marginBottom: 4 },
  rTotalLabel: { color: C.text, fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', flex: 1 },
  rTotalAmt: { color: C.blue, fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  cashNote: { color: C.textMuted, fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: C.text, marginBottom: 16 },
  tlRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tlDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tlLine: { width: 2, flex: 1, minHeight: 20, borderRadius: 1 },
  tlLabel: { fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 3 },
  tlUrdu: { fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.amber + '66', backgroundColor: C.amberGlow, marginBottom: 10 },
  cancelTxt: { color: C.amberDark, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  restartBtn: { backgroundColor: C.surfaceAlt, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  restartTxt: { color: C.textSub, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
});
