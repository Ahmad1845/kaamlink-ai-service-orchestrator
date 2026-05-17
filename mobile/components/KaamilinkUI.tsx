import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Platform, Pressable, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { C } from '../constants/kaamlink';

export function PulsingDot({ color = C.blue }: { color?: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={{ opacity, width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />;
}

type StepStatus = 'waiting' | 'running' | 'done';

export function AgentStepRow({ title, desc, status }: { title: string; desc: string; status: StepStatus }) {
  const isRunning = status === 'running';
  const isDone = status === 'done';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <View style={[s.row, isRunning && s.rowActive]}>
      <View style={s.iconCol}>
        {isDone   && <Ionicons name="checkmark-circle" size={16} color={C.green} />}
        {isRunning && <PulsingDot color={C.blue} />}
        {status === 'waiting' && <Ionicons name="radio-button-off" size={16} color={C.textMuted} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[s.title, status === 'waiting' && { color: C.textMuted }]}>{title}</Text>
          <Text style={s.timestamp}>{timestamp}</Text>
        </View>
        <Text style={[s.desc, status === 'waiting' && { color: C.textMuted }]}>{desc}</Text>
      </View>
    </View>
  );
}

export function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.sectionRow}>
      <Ionicons name={icon as any} size={13} color={C.green} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

export function NavHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={s.nav}>
      {onBack
        ? <Text style={s.backBtn} onPress={onBack}>← Back</Text>
        : <View style={{ width: 60 }} />}
      <Text style={s.navTitle}>{title}</Text>
      <View style={{ width: 60 }} />
    </View>
  );
}

export function Avatar({ name, color = C.blue, size = 44 }: { name: string; color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '33', borderWidth: 1, borderColor: color + '55', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: size * 0.4 }}>{name?.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function AnimatedPressable({ children, style, ...props }: PressableProps & { children: React.ReactNode; style?: any }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 }).start();
        props.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[s.glassCardWrapper, style]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={s.glassCardInner}>
        {children}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 10, alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: C.border + '55' },
  rowActive: { backgroundColor: C.blueGlow, borderRadius: 0, paddingHorizontal: 10, marginHorizontal: -10, borderLeftWidth: 2, borderLeftColor: C.blue, shadowColor: C.blue, shadowOpacity: 0.5, shadowRadius: 10 },
  iconCol: { width: 22, alignItems: 'center', marginRight: 10, marginTop: 2 },
  title: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: C.blue, letterSpacing: 0.5, marginBottom: 3 },
  timestamp: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular', color: C.textMuted },
  desc: { fontSize: 13, color: C.text, lineHeight: 18, fontFamily: 'PlusJakartaSans_400Regular' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.textSub, letterSpacing: 1.2, marginLeft: 7 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  navTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: C.text },
  backBtn: { fontSize: 15, color: C.blue, fontFamily: 'PlusJakartaSans_600SemiBold', width: 60 },
  glassCardWrapper: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  glassCardInner: { padding: 14, backgroundColor: 'rgba(15, 18, 32, 0.4)' },
});
