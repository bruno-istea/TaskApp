import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import {
  PERMISSION_STATE,
  RESOURCES,
  STATE_INFO,
  ensurePermission,
  getPermissionState,
} from '../services/permissions';
import {colors} from '../theme';

const RESOURCE_KEYS = Object.keys(RESOURCES);

/**
 * Muestra el estado de cada permiso (concedido, denegado, bloqueado o
 * pendiente) y permite pedirlo. Sirve para ver cómo responde la app
 * a cada caso.
 */
export default function PermissionsScreen() {
  const [states, setStates] = useState({});

  const refresh = useCallback(async () => {
    const entries = await Promise.all(
      RESOURCE_KEYS.map(async key => [key, await getPermissionState(key)]),
    );
    setStates(Object.fromEntries(entries));
  }, []);

  // Se actualiza cada vez que se abre la pantalla (por ejemplo, al volver
  // de la configuración del celular).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleRequest = async key => {
    await ensurePermission(key);
    await refresh();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          La app pide cada permiso recién cuando lo necesita. Desde acá podés
          ver en qué estado está cada uno.
        </Text>

        {RESOURCE_KEYS.map(key => {
          const state = states[key] ?? PERMISSION_STATE.UNDETERMINED;
          const info = STATE_INFO[state];
          return (
            <View key={key} style={styles.card} testID={`permission-${key}`}>
              <View style={styles.header}>
                <Text style={styles.label}>{RESOURCES[key].label}</Text>
                <Text style={[styles.state, styles[state]]}>
                  {info.icon} {info.text}
                </Text>
              </View>
              <Text style={styles.usage}>Para {RESOURCES[key].usage}.</Text>
              {state !== PERMISSION_STATE.GRANTED && (
                <CustomButton
                  title={
                    state === PERMISSION_STATE.BLOCKED
                      ? 'Cómo activarlo'
                      : 'Pedir permiso'
                  }
                  variant="outline"
                  onPress={() => handleRequest(key)}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
  },
  intro: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  state: {
    fontSize: 14,
    fontWeight: '600',
  },
  granted: {color: colors.success},
  denied: {color: colors.danger},
  blocked: {color: colors.danger},
  undetermined: {color: colors.muted},
  usage: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
