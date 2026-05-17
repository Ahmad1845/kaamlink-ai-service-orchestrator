import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/kaamlink';

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
  pending:   { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  cancelled: { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5' },
};

export default function RequestsScreen({ bookingData, onTabChange, activeTab = 'REQUESTS' }: { bookingData?: any; onTabChange?: (tab: string) => void; activeTab?: string }) {
  // Build a booking card from live flow data if available, else show placeholder
  const booking = bookingData?.selectedBid
    ? {
        id: bookingData.bookingId || 'KL-DEMO',
        service: bookingData.intent?.service || 'AC Repair',
        location: bookingData.intent?.location || 'G-13',
        status: 'confirmed',
        provider: bookingData.selectedBid?.provider_name || 'Hassan Point',
        eta: bookingData.selectedBid?.eta_mins || 14,
        amount: bookingData.selectedBid?.amount || 2050,
        urgency: bookingData.intent?.urgency || 'medium',
      }
    : null;

  const sc = STATUS_COLOR['confirmed'];

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>My Requests</Text>
            <Text style={s.headerSub}>Track your active bookings</Text>
          </View>
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{booking ? '1 Active' : '0 Active'}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {booking ? (
            <>
              <Text style={s.sectionLabel}>ACTIVE BOOKING</Text>

              {/* Live Booking Card */}
              <View style={s.card}>
                {/* Header row */}
                <View style={s.cardHeader}>
                  <View style={s.cardIconWrap}>
                    <Ionicons name="snow-outline" size={22} color={C.blue} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardService}>{booking.service}</Text>
                    <Text style={s.cardLocation}>
                      <Ionicons name="location-outline" size={11} color={C.textMuted} /> {booking.location}
                    </Text>
                  </View>
                  <View style={[s.statusPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Ionicons name="checkmark-circle" size={12} color={sc.text} />
                    <Text style={[s.statusTxt, { color: sc.text }]}> Confirmed</Text>
                  </View>
                </View>

                <View style={s.divider} />

                {/* Booking ID */}
                <View style={s.infoRow}>
                  <Ionicons name="receipt-outline" size={13} color={C.textMuted} />
                  <Text style={s.infoLabel}> Booking ID</Text>
                  <Text style={s.infoVal}>#{booking.id.toString().slice(0, 8).toUpperCase()}</Text>
                </View>

                {/* Provider */}
                <View style={s.infoRow}>
                  <Ionicons name="person-outline" size={13} color={C.textMuted} />
                  <Text style={s.infoLabel}> Provider</Text>
                  <Text style={s.infoVal}>{booking.provider}</Text>
                </View>

                {/* ETA */}
                <View style={s.infoRow}>
                  <Ionicons name="time-outline" size={13} color={C.green} />
                  <Text style={s.infoLabel}> ETA</Text>
                  <Text style={[s.infoVal, { color: C.green }]}>{booking.eta} min</Text>
                </View>

                {/* Amount */}
                <View style={s.infoRow}>
                  <Ionicons name="cash-outline" size={13} color={C.textMuted} />
                  <Text style={s.infoLabel}> Amount</Text>
                  <Text style={s.infoVal}>Rs. {booking.amount.toLocaleString()}</Text>
                </View>

                <View style={s.divider} />

                <View style={s.actionRow}>
                  <TouchableOpacity style={s.trackBtn} activeOpacity={0.8}>
                    <Ionicons name="navigate" size={14} color="#fff" />
                    <Text style={s.trackTxt}> Track Live</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.callBtn} activeOpacity={0.8}>
                    <Ionicons name="call-outline" size={14} color={C.blue} />
                    <Text style={s.callTxt}> Call Provider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            /* Empty State */
            <View style={s.emptyWrap}>
              <View style={s.emptyIcon}>
                <Ionicons name="receipt-outline" size={40} color={C.textMuted} />
              </View>
              <Text style={s.emptyTitle}>No Active Requests</Text>
              <Text style={s.emptySub}>Your bookings will appear here once you submit a service request from the Home tab.</Text>
            </View>
          )}

          {/* Past Bookings Section */}
          <Text style={[s.sectionLabel, { marginTop: 8 }]}>PAST BOOKINGS</Text>
          {[
            { service: 'Plumbing Repair', date: '15 May 2026', amount: 'Rs. 1,200', status: 'confirmed' },
            { service: 'Electrician',     date: '10 May 2026', amount: 'Rs. 800',   status: 'confirmed' },
            { service: 'AC Cleaning',     date: '2 May 2026',  amount: 'Rs. 2,500', status: 'cancelled' },
          ].map((b, i) => {
            const c = STATUS_COLOR[b.status];
            return (
              <View key={i} style={s.pastRow}>
                <View style={s.pastLeft}>
                  <Text style={s.pastService}>{b.service}</Text>
                  <Text style={s.pastDate}>{b.date}</Text>
                </View>
                <View style={s.pastRight}>
                  <Text style={s.pastAmount}>{b.amount}</Text>
                  <View style={[s.statusPill, { backgroundColor: c.bg, borderColor: c.border, marginTop: 4 }]}>
                    <Text style={[s.statusTxt, { color: c.text }]}>{b.status}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
              <TouchableOpacity key={label} style={s.tab} onPress={() => onTabChange?.(label)} activeOpacity={0.7}>
                <Ionicons name={icon as any} size={20} color={active ? C.blue : C.textMuted} />
                <Text style={[s.tabLabel, active && { color: C.blue }]}>{label}</Text>
                {active && <View style={s.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 22, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text },
  headerSub: { fontSize: 12, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 1 },
  badge: { backgroundColor: C.blueGlow, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.blue + '44' },
  badgeTxt: { color: C.blue, fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' },
  sectionLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.blueGlow, alignItems: 'center', justifyContent: 'center' },
  cardService: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: C.text, marginBottom: 2 },
  cardLocation: { fontSize: 12, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular' },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoLabel: { flex: 1, fontSize: 13, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular' },
  infoVal: { fontSize: 13, color: C.text, fontFamily: 'PlusJakartaSans_600SemiBold' },
  actionRow: { flexDirection: 'row', gap: 10 },
  trackBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, borderRadius: 12, padding: 13 },
  trackTxt: { color: '#fff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blueGlow, borderRadius: 12, padding: 13, borderWidth: 1.5, borderColor: C.blue },
  callTxt: { color: C.blue, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center', lineHeight: 20 },
  pastRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  pastLeft: { flex: 1 },
  pastService: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: C.text, marginBottom: 4 },
  pastDate: { fontSize: 12, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular' },
  pastRight: { alignItems: 'flex-end' },
  pastAmount: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: C.text },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface, paddingBottom: 20, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: C.textMuted, letterSpacing: 0.5 },
  tabIndicator: { position: 'absolute', bottom: -8, width: 20, height: 2, backgroundColor: C.blue, borderRadius: 1 },
});
