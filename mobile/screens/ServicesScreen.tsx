import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/kaamlink';

const SERVICES = [
  { icon: 'snow-outline',          label: 'AC Repair',    color: '#3B82F6', bg: '#EFF6FF' },
  { icon: 'water-outline',         label: 'Plumber',      color: '#06B6D4', bg: '#ECFEFF' },
  { icon: 'flash-outline',         label: 'Electrician',  color: '#F59E0B', bg: '#FEF3C7' },
  { icon: 'hammer-outline',        label: 'Carpenter',    color: '#92400E', bg: '#FEF9EE' },
  { icon: 'flame-outline',         label: 'Geyser',       color: '#EF4444', bg: '#FEF2F2' },
  { icon: 'car-outline',           label: 'Car Wash',     color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: 'brush-outline',         label: 'Painter',      color: '#10B981', bg: '#ECFDF5' },
  { icon: 'bug-outline',           label: 'Pest Control', color: '#6D28D9', bg: '#EDE9FE' },
  { icon: 'home-outline',          label: 'Cleaning',     color: '#0891B2', bg: '#ECFEFF' },
  { icon: 'settings-outline',      label: 'Appliances',   color: '#475569', bg: '#F1F5F9' },
  { icon: 'leaf-outline',          label: 'Gardening',    color: '#16A34A', bg: '#F0FDF4' },
  { icon: 'shield-checkmark-outline', label: 'Security', color: '#1D4ED8', bg: '#EFF6FF' },
];

export default function ServicesScreen({ onTabChange, activeTab = 'SERVICES' }: { onTabChange?: (tab: string) => void; activeTab?: string }) {
  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Services</Text>
            <Text style={s.headerSub}>What do you need help with?</Text>
          </View>
          <View style={s.searchBtn}>
            <Ionicons name="search-outline" size={18} color={C.textMuted} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Featured banner */}
          <View style={s.banner}>
            <View style={s.bannerLeft}>
              <View style={s.bannerBadge}><Text style={s.bannerBadgeTxt}>AI POWERED</Text></View>
              <Text style={s.bannerTitle}>Instant Booking</Text>
              <Text style={s.bannerSub}>7 agents working for you</Text>
            </View>
            <View style={s.bannerRight}>
              <Ionicons name="hardware-chip-outline" size={48} color={C.blue + '44'} />
            </View>
          </View>

          {/* Section */}
          <Text style={s.sectionLabel}>ALL CATEGORIES</Text>

          {/* Grid */}
          <View style={s.grid}>
            {SERVICES.map((svc) => (
              <TouchableOpacity key={svc.label} style={s.cell} activeOpacity={0.75}>
                <View style={[s.iconWrap, { backgroundColor: svc.bg }]}>
                  <Ionicons name={svc.icon as any} size={26} color={svc.color} />
                </View>
                <Text style={s.cellLabel}>{svc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular section */}
          <Text style={[s.sectionLabel, { marginTop: 8 }]}>MOST BOOKED THIS WEEK</Text>
          {[
            { label: 'AC Gas Refilling', icon: 'snow-outline', color: '#3B82F6', bookings: '248 bookings' },
            { label: 'Emergency Plumber', icon: 'water-outline', color: '#06B6D4', bookings: '183 bookings' },
            { label: 'Home Deep Clean', icon: 'home-outline', color: '#0891B2', bookings: '127 bookings' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={s.popularRow} activeOpacity={0.75}>
              <View style={[s.popularIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.popularLabel}>{item.label}</Text>
                <Text style={s.popularBookings}>{item.bookings}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
            </TouchableOpacity>
          ))}
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
  searchBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  banner: { backgroundColor: C.blueGlow, borderRadius: 16, padding: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.blue + '33', overflow: 'hidden' },
  bannerLeft: { flex: 1 },
  bannerRight: { marginLeft: 10 },
  bannerBadge: { alignSelf: 'flex-start', backgroundColor: C.blue, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  bannerBadgeTxt: { color: '#fff', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1 },
  bannerTitle: { fontSize: 20, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blueDark, marginBottom: 4 },
  bannerSub: { fontSize: 12, color: C.blue, fontFamily: 'PlusJakartaSans_400Regular' },
  sectionLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  cell: { width: '22%', alignItems: 'center', gap: 8 },
  iconWrap: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cellLabel: { fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold', color: C.text, textAlign: 'center' },
  popularRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  popularIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  popularLabel: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: C.text, marginBottom: 2 },
  popularBookings: { fontSize: 12, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular' },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface, paddingBottom: 20, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: C.textMuted, letterSpacing: 0.5 },
  tabIndicator: { position: 'absolute', bottom: -8, width: 20, height: 2, backgroundColor: C.blue, borderRadius: 1 },
});
