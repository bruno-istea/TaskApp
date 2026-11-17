import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AttachmentsEditor from '../components/AttachmentsEditor';
import CustomButton from '../components/CustomButton';
import {selectTaskById, useTaskStore} from '../stores/taskStore';
import {colors} from '../theme';
import {formatTime} from '../utils/validation';

/**
 * Detalle de una tarea: muestra y permite cambiar la foto, el lugar,
 * el responsable y el evento del calendario.
 * Lee la tarea directamente del store global con un selector.
 */
export default function TaskDetailScreen({route, navigation}) {
  const {id} = route.params;
  const task = useTaskStore(selectTaskById(id));
  const updateTask = useTaskStore(s => s.updateTask);
  const toggleTask = useTaskStore(s => s.toggleTask);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missing}>Esta tarea ya no existe.</Text>
        <CustomButton title="Volver" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, task.done && styles.titleDone]}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.status}>
            {task.done ? '✅ Hecha' : '⏳ Pendiente'}
          </Text>
          {task.reminderAt && (
            <Text style={styles.status}>
              ⏰ Recordatorio {formatTime(task.reminderAt)}
            </Text>
          )}
        </View>

        <AttachmentsEditor
          title={task.title}
          value={{
            photoUri: task.photoUri ?? null,
            location: task.location ?? null,
            contact: task.contact ?? null,
            calendarEvent: task.calendarEvent ?? null,
          }}
          onChange={changes => updateTask(task.id, changes)}
        />

        <CustomButton
          title={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
          variant={task.done ? 'outline' : 'primary'}
          onPress={() => toggleTask(task.id)}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  status: {
    color: colors.muted,
    fontSize: 14,
  },
  missing: {
    textAlign: 'center',
    color: colors.muted,
    margin: 20,
  },
});
