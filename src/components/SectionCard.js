import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';

/** Tarjeta con título para agrupar una sección del formulario. */
export default function SectionCard({icon, title, children}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {icon} {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
});
