import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import TaskItem from '../components/TaskItem';
import {useAuth} from '../context/AuthContext';
import {cancelReminder} from '../services/notifications';
import {getTasks, saveTasks} from '../storage/storage';
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
  const {user, logout} = useAuth();
  const [tasks, setTasks] = useState([]);

  // Botón "Salir" en el header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <LogoutButton onPress={logout} />,
    });
  }, [navigation, logout]);

  // Recarga las tareas cada vez que la pantalla vuelve a estar visible
  useFocusEffect(
    useCallback(() => {
      getTasks(user).then(setTasks);
    }, [user]),
  );

  const updateTasks = async newTasks => {
    setTasks(newTasks);
    await saveTasks(user, newTasks);
  };

  const handleToggle = id => {
    updateTasks(tasks.map(t => (t.id === id ? {...t, done: !t.done} : t)));
  };

  const handleDelete = id => {
    const task = tasks.find(t => t.id === id);
    Alert.alert('Eliminar tarea', `¿Eliminar "${task.title}"?`, [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await cancelReminder(task.notificationId);
          updateTasks(tasks.filter(t => t.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hola, {user} 👋</Text>
      <Text style={styles.summary}>
        {tasks.length === 0
          ? 'Todavía no tenés tareas.'
          : `${countPending(tasks)} pendiente(s) de ${tasks.length}`}
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
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
    </View>
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
  summary: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 16,
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
