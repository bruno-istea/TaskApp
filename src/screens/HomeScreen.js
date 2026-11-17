import React, {useLayoutEffect} from 'react';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import CustomButton from '../components/CustomButton';
import TaskItem from '../components/TaskItem';
import {deleteCalendarEvent} from '../services/device';
import {cancelReminder} from '../services/notifications';
import {useAuthStore} from '../stores/authStore';
import {useTaskStore} from '../stores/taskStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme';
import {countPending} from '../utils/validation';

// Botón "Salir" del header (definido afuera para no recrearlo en cada render)
function LogoutButton({onPress}) {
  return (
    <Text style={styles.logout} onPress={onPress}>
      Salir
    </Text>
  );
}

export default function HomeScreen({navigation}) {
  // Estado global con selectores: sin useState ni props pasadas a mano.
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const tasks = useTaskStore(s => s.tasks);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const removeTask = useTaskStore(s => s.removeTask);

  // Botón "Salir" en el header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <LogoutButton onPress={logout} />,
    });
  }, [navigation, logout]);

  const handleToggle = id => toggleTask(id);

  const handleDelete = id => {
    const task = tasks.find(t => t.id === id);
    Alert.alert('Eliminar tarea', `¿Eliminar "${task.title}"?`, [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await cancelReminder(task.notificationId);
          await deleteCalendarEvent(task.calendarEvent?.id);
          await removeTask(id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.greeting}>Hola, {user} 👋</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summary}>
          {tasks.length === 0
            ? 'Todavía no tenés tareas.'
            : `${countPending(tasks)} pendiente(s) de ${tasks.length}`}
        </Text>
        <Text
          style={styles.permissions}
          onPress={() => navigation.navigate('Permissions')}>
          🔒 Permisos
        </Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPress={id => navigation.navigate('TaskDetail', {id})}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Tocá “Nueva tarea” para agregar la primera.
          </Text>
        }
        contentContainerStyle={styles.list}
      />

      <CustomButton
        title="+ Nueva tarea"
        onPress={() => navigation.navigate('AddTask')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  summary: {
    fontSize: 15,
    color: colors.muted,
  },
  permissions: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    flexGrow: 1,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40,
  },
  logout: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
});
