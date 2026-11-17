import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AttachmentsEditor from '../components/AttachmentsEditor';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import {deleteCalendarEvent} from '../services/device';
import {scheduleTaskReminder} from '../services/notifications';
import {useTaskStore} from '../stores/taskStore';
import {SafeAreaView} from 'react-native-safe-area-context';
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
  const addTask = useTaskStore(s => s.addTask);
  const [title, setTitle] = useState('');
  // Foto, ubicación, responsable y evento del calendario (Parcial 2)
  const [attachments, setAttachments] = useState({
    photoUri: null,
    location: null,
    contact: null,
    calendarEvent: null,
  });
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
    let reminderAt = null;
    let notificationId = null;

    // Si la notificación falla, la tarea se guarda igual (sin recordatorio).
    if (reminder > 0) {
      try {
        notificationId = await scheduleTaskReminder(title.trim(), reminder);
        if (notificationId) {
          reminderAt = Date.now() + reminder * 1000;
        } else {
          Alert.alert(
            'Sin permiso',
            'La tarea se guardó, pero no hay permiso para mostrar notificaciones.',
          );
        }
      } catch (e) {
        Alert.alert(
          'No se pudo programar el aviso',
          `La tarea se guardó sin recordatorio.\n\nDetalle: ${e?.message ?? e}`,
        );
      }
    }

    try {
      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        done: false,
        reminderAt,
        notificationId,
        ...attachments,
      };

      await addTask(newTask); // store global: guarda y actualiza la lista
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        'Error',
        `No se pudo guardar la tarea.\n\nDetalle: ${e?.message ?? e}`,
      );
      setSaving(false);
    }
  };

  // Si cancela, se borra el evento del calendario que ya se había creado.
  const handleCancel = async () => {
    await deleteCalendarEvent(attachments.calendarEvent?.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
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
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Vas a recibir una notificación cuando se cumpla el tiempo elegido.
        </Text>

        <AttachmentsEditor
          title={title}
          value={attachments}
          onChange={changes => setAttachments(prev => ({...prev, ...changes}))}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <CustomButton
          title={saving ? 'Guardando...' : 'Guardar tarea'}
          onPress={handleSave}
          disabled={saving}
        />
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={handleCancel}
        />
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
    marginBottom: 16,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
});
