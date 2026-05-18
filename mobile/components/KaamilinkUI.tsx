import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated, PressableProps, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/kaamlink';

// ── Card ──────────────────────────────────────────────────────────────────────
export function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ── Nav Header ────────────────────────────────────────────────────────────────
export function NavHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={s.navHeader}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
      ) : <View style={s.backBtn} />}
      <Text style={s.navTitle}>{title}</Text>
      <View style={s.backBtn} />
    </View>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.sectionHeader}>
      <Ionicons name={icon as any} size={13} color={C.blue} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 44 }: { name: string; color?: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: C.blueGlow, borderColor: C.blue }]}>
      <Text style={[s.avatarTxt, { color: C.blue, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

// ── Agent Step Row ─────────────────────────────────────────────────────────────
export function AgentStepRow({ title, desc, status, isLast }: { title: string; desc: string; status: 'done' | 'running' | 'waiting', isLast?: boolean }) {
  const isWaiting = status === 'waiting';
  const dotColor = status === 'done' ? C.green : status === 'running' ? C.blue : 'transparent';
  const borderColor = isWaiting ? C.textMuted : 'transparent';
  const txtColor = isWaiting ? C.textMuted : C.text;
  
  return (
    <View style={s.stepRow}>
      {/* Vertical connecting line */}
      {!isLast && (
        <View style={{ position: 'absolute', left: 10, top: 24, bottom: -12, width: 2, backgroundColor: C.blue, opacity: isWaiting ? 0.3 : 1 }} />
      )}
      
      <View style={[s.stepDot, { backgroundColor: dotColor, borderWidth: isWaiting ? 1.5 : 0, borderColor }]}>
        {status === 'done' && <Ionicons name="checkmark" size={12} color="#fff" />}
        {status === 'running' && <PulsingDot color="#fff" size={8} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.stepTitle, { color: txtColor, fontFamily: 'JetBrainsMono_400Regular' }]}>{title}</Text>
        <Text style={s.stepDesc}>{desc}</Text>
      </View>
      {status === 'done' && <Ionicons name="checkmark-circle" size={16} color={C.green} />}
    </View>
  );
}

// ── Pulsing Dot ───────────────────────────────────────────────────────────────
export function PulsingDot({ color, size = 8 }: { color: string; size?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />;
}

// ── Animated Pressable ────────────────────────────────────────────────────────
const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ children, style, ...props }: PressableProps & { children: React.ReactNode; style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedPressableBase
      {...props}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={(e: any) => { Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start(); props.onPressIn?.(e); }}
      onPressOut={(e: any) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 }).start(); props.onPressOut?.(e); }}
    >
      {children}
    </AnimatedPressableBase>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', color: C.text, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, letterSpacing: 1.2 },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarTxt: { fontFamily: 'PlusJakartaSans_800ExtraBold' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepTitle: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', marginBottom: 2 },
  stepDesc: { fontSize: 12, color: C.textMuted, fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 17 },
});
