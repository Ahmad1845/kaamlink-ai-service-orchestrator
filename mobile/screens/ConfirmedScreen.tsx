import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { C, API_BASE } from '../constants/kaamlink';
import { Avatar, AgentStepRow } from '../components/KaamilinkUI';

const TIMELINE = [
  { label: 'Booking Confirmed',  urdu: 'Booking confirm ho gayi ✅',  color: C.green,  icon: 'checkmark-circle' },
  { label: 'Provider En Route',  urdu: 'Provider raaston par hai 🚗', color: C.blue,   icon: 'navigate' },
  { label: 'Provider Arrived',   urdu: 'Provider pahunch gaya 📍',    color: C.blue,   icon: 'location' },
  { label: 'Service In Progress',urdu: 'Kaam shuru ho gaya 🔧',       color: C.purple, icon: 'hammer' },
  { label: 'Completed ⭐',        urdu: 'Kaam mukammal! Rating dein',  color: C.amber,  icon: 'star' },
];

export default function ConfirmedScreen({ data, onSimulateCancel, onRestart }: { data: any; onSimulateCancel: () => void; onRestart: () => void }) {
  const { intent, selectedBid, pricing, userBudget } = data;
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [tlStep, setTlStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    fetch(`${API_BASE}/api/book`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: selectedBid.provider_id, user_id: 'demo-user', service: intent.service, amount: selectedBid.amount }) })
      .then(r => r.json()).then(d => setBookingId(d.booking_id)).catch(() => setBookingId('demo-' + Date.now()));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setTlStep(TIMELINE.length), 3000);
    return () => clearTimeout(t);
  }, []);

  const isHigh = intent?.urgency === 'high';
  const base = selectedBid.amount;
  const emergency = isHigh ? 500 : 0;
  const platform = 75;
  const total = base + emergency + platform;

  return (
    <LinearGradient colors={['#0F1220', '#080B14']} style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        <View style={s.heroCard}>
          <View style={s.successCircle}><Ionicons name="checkmark-circle" size={52} color={C.green} /></View>
          <Text style={s.heroTitle}>Booking Confirmed!</Text>
          <Text style={s.heroSub}>{selectedBid.provider_name} aapki taraf aa rahe hain</Text>
          <View style={s.refRow}><Ionicons name="receipt-outline" size={13} color={C.textMuted} /><Text style={s.refTxt}> #{bookingId?.slice(0, 8).toUpperCase() || '...'}</Text></View>
        </View>

        <View style={s.providerCard}>
          <View style={s.provRow}>
            <Avatar name={selectedBid.provider_name} color={C.blue} size={52} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.provName}>{selectedBid.provider_name}</Text>
              <View style={s.etaRow}><Ionicons name="time-outline" size={14} color={C.green} /><Text style={s.etaTxt}> {selectedBid.eta_mins} min ETA</Text></View>
            </View>
            <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveTxt}>LIVE</Text></View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}><Text style={s.infoLabel}>Service</Text><Text style={s.infoVal}>{intent.service}{isHigh ? ' (Urgent)' : ''}</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Location</Text><Text style={s.infoVal}>{intent.location}</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Urgency</Text><Text style={[s.infoVal, { color: isHigh ? C.red : C.amber, textTransform: 'capitalize' }]}>{intent.urgency}</Text></View>
        </View>

        <View style={s.receiptCard}>
          <Text style={s.watermark}>CONFIRMED</Text>
          <View style={s.receiptHeader}><Text style={s.receiptTitle}>Service Receipt</Text><Text style={s.receiptId}>#{bookingId?.slice(0, 8).toUpperCase() || 'KL-DEMO'}</Text></View>
          <View style={s.rRow}><Text style={s.rItem}>Base Charge</Text><Text style={s.rAmt}>PKR {base.toLocaleString()}</Text></View>
          {isHigh && <View style={s.rRow}><Text style={s.rItem}>Urgency Fee</Text><Text style={[s.rAmt, { color: C.red }]}>PKR {emergency}</Text></View>}
          <View style={s.rRow}><Text style={s.rItem}>Platform Fee</Text><Text style={s.rAmt}>PKR {platform}</Text></View>
          <View style={s.rDivider} />
          <View style={[s.rRow, s.rTotalRow]}>
            <Text style={s.rTotalLabel}>Est. Total</Text>
            <Text style={s.rTotalAmt}>PKR {total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={s.timelineCard}>
          <Text style={s.sectionTitle}>Service Timeline</Text>
          {TIMELINE.map((item, i) => {
            const isActive = i === tlStep;
            return (
              <View key={i} style={s.tlRow}>
                <View style={{ alignItems: 'center', marginRight: 12 }}>
                  <View style={[s.tlDot, { backgroundColor: i < tlStep ? item.color : C.border }, isActive && { shadowColor: item.color, shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, backgroundColor: item.color + '88', borderWidth: 2, borderColor: item.color }]}>
                    {i < tlStep ? <Ionicons name="checkmark-done" size={14} color="#fff" /> : isActive ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} /> : null}
                  </View>
                  {i < TIMELINE.length - 1 && (
                    i < tlStep - 1 ? <View style={[s.tlLine, { backgroundColor: item.color }]} /> :
                    i === tlStep - 1 ? <LinearGradient colors={[item.color, C.border]} style={s.tlLine} /> :
                    <View style={[s.tlLine, { backgroundColor: C.border }]} />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: 20 }}>
                  <Text style={[s.tlLabel, { color: i <= tlStep ? C.text : C.textMuted }]}>{item.label}</Text>
                  {i <= tlStep && <Text style={[s.tlUrdu, { color: i < tlStep ? item.color : C.textSub }]}>{item.urdu}</Text>}
                </View>
                {i < tlStep && <Ionicons name="checkmark" size={16} color={item.color} />}
              </View>
            );
          })}
        </View>

        <View style={s.agentCard}>
          <AgentStepRow title="[4] BOOKING AGENT" desc={`Booking ${bookingId?.slice(0, 8) || '...'} confirmed and logged`} status={bookingId ? 'done' : 'running'} />
        </View>

        <TouchableOpacity style={s.cancelBtn} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onSimulateCancel(); }}>
          <Ionicons name="warning-outline" size={16} color={C.amber} />
          <Text style={s.cancelTxt}> Simulate Provider Cancellation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.restartBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRestart(); }}><Text style={s.restartTxt}>New Request</Text></TouchableOpacity>
      </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  heroCard: { alignItems: 'center', backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 20, borderWidth: 1, borderColor: C.green + '44', padding: 28, marginBottom: 14 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.green + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: C.green + '33' },
  heroTitle: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 6 },
  heroSub: { fontSize: 14, color: C.textSub, marginBottom: 8, fontFamily: 'PlusJakartaSans_400Regular' },
  refRow: { flexDirection: 'row', alignItems: 'center' },
  refTxt: { color: C.textMuted, fontSize: 13, fontFamily: 'JetBrainsMono_400Regular' },
  providerCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14 },
  provRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  provName: { fontSize: 17, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 4 },
  etaRow: { flexDirection: 'row', alignItems: 'center' },
  etaTxt: { color: C.green, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.green + '15', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.green + '33' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginRight: 5 },
  liveTxt: { color: C.green, fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: C.textMuted, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' },
  infoVal: { color: C.text, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },
  receiptCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 18, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', padding: 16, marginBottom: 14, overflow: 'hidden' },
  watermark: { position: 'absolute', opacity: 0.05, fontSize: 50, fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFF', transform: [{ rotate: '-15deg' }], top: 50, left: -10 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  receiptTitle: { color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
  receiptId: { color: C.textMuted, fontSize: 13, fontFamily: 'JetBrainsMono_400Regular' },
  rRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rItem: { color: C.textSub, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' },
  rAmt: { color: C.text, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },
  rDivider: { height: 1, backgroundColor: C.border, borderStyle: 'dashed', marginVertical: 12 },
  rTotalRow: { backgroundColor: '#161B2E', padding: 14, marginHorizontal: -16, marginBottom: -16, borderLeftWidth: 4, borderLeftColor: C.accent, alignItems: 'center' },
  rTotalLabel: { color: C.textSub, fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },
  rTotalAmt: { color: C.text, fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  timelineCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 14 },
  sectionTitle: { color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, marginBottom: 18 },
  tlRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tlDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tlLine: { width: 2, flex: 1, minHeight: 16, marginTop: 2 },
  tlLabel: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 4 },
  tlUrdu: { fontSize: 14, fontFamily: 'PlusJakartaSans_500Medium' },
  agentCard: { backgroundColor: 'rgba(15, 18, 32, 0.6)', borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.amber + '15', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.amber + '44' },
  cancelTxt: { color: C.amber, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  restartBtn: { alignItems: 'center', padding: 14 },
  restartTxt: { color: C.textMuted, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
});
