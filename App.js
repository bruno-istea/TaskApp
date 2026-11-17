import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AddTaskScreen from './src/screens/AddTaskScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import {useAuthStore} from './src/stores/authStore';
import {useTaskStore} from './src/stores/taskStore';
import {colors} from './src/theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  // Estado global (Zustand): cada selector lee solo lo que necesita.
  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  const restoreSession = useAuthStore(s => s.restoreSession);
  const loadTasks = useTaskStore(s => s.loadTasks);

  // Al abrir la app, recupera la sesión guardada.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Cuando hay un usuario logueado, carga sus tareas en el store.
  useEffect(() => {
    if (user) {
      loadTasks(user);
    }
  }, [user, loadTasks]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      {user ? (
        // Pantallas protegidas: solo existen si hay sesión iniciada.
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Mis tareas'}}
          />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{title: 'Nueva tarea'}}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{title: 'Detalle de la tarea'}}
          />
          <Stack.Screen
            name="Permissions"
            component={PermissionsScreen}
            options={{title: 'Permisos'}}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{title: 'Registro'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
});
