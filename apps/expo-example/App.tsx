import { FlashList } from "@shopify/flash-list";
import { type Background, MOODS, type Mood } from "@wobblies/core";
import { Wobbly } from "@wobblies/react-native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

const BACKGROUNDS: readonly Background[] = ["circle", "squircle", "square", "none"];
const CORPUS = ["Ada Lovelace", "José", "李雷", "ana@example.com", "Wobbly", ""];
const NAMES: readonly string[] = [...CORPUS, ...Array.from({ length: 194 }, (_, i) => `user${i}`)];

type SegmentedProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmentRow}>
      <Text style={styles.segmentLabel}>{label}</Text>
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityState={{ selected: option === value }}
          onPress={() => onChange(option)}
          style={[styles.segment, option === value && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, option === value && styles.segmentTextActive]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function App() {
  const [mood, setMood] = useState<Mood>("idle");
  const [background, setBackground] = useState<Background>("circle");
  const [selected, setSelected] = useState<string>(NAMES[0] ?? "user0");

  const extraData = useMemo(() => ({ mood, background }), [mood, background]);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable accessibilityRole="button" onPress={() => setSelected(item)} style={styles.row}>
        <Wobbly name={item} size={44} mood={mood} background={background} decorative />
        <Text style={styles.rowText}>{item === "" ? "(empty name)" : item}</Text>
      </Pressable>
    ),
    [mood, background],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Wobblies</Text>
        <Segmented label="Mood" options={MOODS} value={mood} onChange={setMood} />
        <Segmented
          label="Background"
          options={BACKGROUNDS}
          value={background}
          onChange={setBackground}
        />
        <View style={styles.preview}>
          <Wobbly name={selected} size={160} mood={mood} background={background} />
          <Text style={styles.previewName}>{selected === "" ? "(empty name)" : selected}</Text>
        </View>
      </View>
      <FlashList
        data={NAMES}
        extraData={extraData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}-${item}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  segmentLabel: { width: 84, fontWeight: "600" },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  segmentActive: { backgroundColor: "#222", borderColor: "#222" },
  segmentText: { color: "#222" },
  segmentTextActive: { color: "#fff" },
  preview: { alignItems: "center", paddingVertical: 12, gap: 6 },
  previewName: { fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 56 },
  rowText: { fontSize: 16 },
});
