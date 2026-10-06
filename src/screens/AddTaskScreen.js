import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import {useAuth} from '../context/AuthContext';
import {scheduleTaskReminder} from '../services/notifications';
import {getTasks, saveTasks} from '../storage/storage';
import {colors} from '../theme';
import {validateTask} from '../utils/validation';

// Opciones de recordatorio (en segundos). 0 = sin recordatorio.
const REMINDER_OPTIONS = [
  {label: 'Sin aviso', seconds: 0},
  {label: '5 seg', seconds: 5},
  {label: '10 seg', seconds: 10},
  {label: '1 min', seconds: 60},
  {label: '5 min', seconds: 300},
  {label: '30 min', seconds: 1800},
];

export default function AddTaskScreen({navigation}) {
  const {user} = useAuth();
  const [title, setTitle] = useState('');
  const [reminder, setReminder] = useState(5);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validationError = validateTask(title);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      let reminderAt = null;
      let notificationId = null;

      if (reminder > 0) {
        reminderAt = Date.now() + reminder * 1000;
        notificationId = await scheduleTaskReminder(title.trim(), reminder);
      }

      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        done: false,
        reminderAt,
        notificationId,
      };

      const tasks = await getTasks(user);
      await saveTasks(user, [newTask, ...tasks]);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la tarea.');
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <FormInput
        label="Título de la tarea"
        placeholder="Ej: Estudiar para el parcial"
        value={title}
        onChangeText={setTitle}
        autoCapitalize="sentences"
        maxLength={60}
      />

      <Text style={styles.label}>Recordatorio</Text>
      <View style={styles.options}>
        {REMINDER_OPTIONS.map(opt => {
          const selected = opt.seconds === reminder;
          return (
            <TouchableOpacity
              key={opt.seconds}
              onPress={() => setReminder(opt.seconds)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>
        Vas a recibir una notificación cuando se cumpla el tiempo elegido.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <CustomButton
        title={saving ? 'Guardando...' : 'Guardar tarea'}
        onPress={handleSave}
        disabled={saving}
      />
      <CustomButton
        title="Cancelar"
        variant="outline"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
});
