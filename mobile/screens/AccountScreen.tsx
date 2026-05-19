import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Animated, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/kaamlink';
import { GlassCard, AnimatedPressable, SectionHeader } from '../components/KaamilinkUI';

export default function AccountScreen({ onTabChange, activeTab = 'ACCOUNT' }: { onTabChange?: (tab: string) => void; activeTab?: string }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={s.root}>
            <SafeAreaView style={{ flex: 1 }}>
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                        <Text style={s.heading}>Profile</Text>
                        <Text style={s.subheading}>Manage your account and settings</Text>

                        {/* Profile Info */}
                        <GlassCard style={{ paddingBottom: 24, marginTop: 10, alignItems: 'center' }}>
                            <View style={s.avatar}>
                                <Text style={s.avatarText}>MA</Text>
                            </View>
                            <Text style={s.profileName}>Muhammad Ahmad</Text>
                            <Text style={s.profileEmail}>ahmad@example.com</Text>
                            <View style={s.statsRow}>
                                <View style={s.statBox}>
                                    <Text style={s.statValue}>12</Text>
                                    <Text style={s.statLabel}>Total Bookings</Text>
                                </View>
                                <View style={s.divider} />
                                <View style={s.statBox}>
                                    <Text style={s.statValue}>450</Text>
                                    <Text style={s.statLabel}>Kaam Points</Text>
                                    <Ionicons name="star" size={12} color={C.amber} style={{ position: 'absolute', top: 5, right: 6 }} />
                                </View>
                            </View>
                        </GlassCard>

                        <GlassCard style={{ marginTop: 16 }}>
                            <SectionHeader icon="settings-outline" label="ACCOUNT SETTINGS" />
                            <View style={s.menuItem}>
                                <Ionicons name="person-circle-outline" size={24} color={C.textMuted} />
                                <Text style={s.menuText}>Personal Details</Text>
                                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                            </View>
                            <View style={s.menuItem}>
                                <Ionicons name="card-outline" size={24} color={C.textMuted} />
                                <Text style={s.menuText}>Payment Methods</Text>
                                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                            </View>
                            <View style={s.menuItem}>
                                <Ionicons name="location-outline" size={24} color={C.textMuted} />
                                <Text style={s.menuText}>Saved Addresses</Text>
                                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                            </View>
                            <View style={s.menuItem}>
                                <Ionicons name="notifications-outline" size={24} color={C.textMuted} />
                                <Text style={s.menuText}>Notifications</Text>
                                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                            </View>
                        </GlassCard>

                        <AnimatedPressable style={s.logoutBtn}>
                            <Text style={s.logoutBtnText}>Log Out</Text>
                        </AnimatedPressable>

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
    heading: { fontSize: 28, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text, marginBottom: 4 },
    subheading: { fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: C.textMuted, marginBottom: 16 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: C.blueGlow },
    avatarText: { fontSize: 32, fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#fff' },
    profileName: { fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold', color: C.text, marginBottom: 4 },
    profileEmail: { fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: C.textMuted, marginBottom: 20 },
    statsRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16 },
    statBox: { flex: 1, alignItems: 'center' },
    divider: { width: 1, backgroundColor: C.border, height: '100%' },
    statValue: { fontSize: 20, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.text },
    statLabel: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', color: C.textMuted, marginTop: 4 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    menuText: { flex: 1, fontSize: 15, fontFamily: 'PlusJakartaSans_500Medium', color: C.text, marginLeft: 12 },
    logoutBtn: { marginTop: 24, paddingVertical: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.red + '44', borderRadius: 12, alignItems: 'center' },
    logoutBtnText: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: C.red },
    tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 },
    tab: { flex: 1, alignItems: 'center', gap: 3 },
    tabLabel: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: C.textMuted, letterSpacing: 0.5 },
    tabIndicator: { position: 'absolute', bottom: -8, width: 20, height: 2, backgroundColor: C.blue, borderRadius: 1 },
});
