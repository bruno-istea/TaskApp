import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../theme';
import {formatTime} from '../utils/validation';

/**
 * Ítem de la lista de tareas (componente reutilizable).
 * - Tocar el círculo marca/desmarca la tarea como hecha.
 * - Tocar "Eliminar" borra la tarea.
 */
export default function TaskItem({task, onToggle, onDelete}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        testID="task-toggle"
        accessibilityLabel={task.done ? 'Marcar pendiente' : 'Marcar hecha'}
        onPress={() => onToggle(task.id)}
        style={[styles.check, task.done && styles.checkDone]}>
        {task.done && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.title, task.done && styles.titleDone]}>
          {task.title}
        </Text>
        {task.reminderAt ? (
          <Text style={styles.reminder}>
            ⏰ Recordatorio: {formatTime(task.reminderAt)}
          </Text>
        ) : (
          <Text style={styles.reminder}>Sin recordatorio</Text>
        )}
      </View>

      <TouchableOpacity
        testID="task-delete"
        onPress={() => onDelete(task.id)}
        style={styles.deleteButton}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkMark: {
    color: '#fff',
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  reminder: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
