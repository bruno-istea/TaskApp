import React, {useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import {useAuth} from '../context/AuthContext';
import {checkCredentials} from '../storage/storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme';
import {validateLogin} from '../utils/validation';

export default function LoginScreen({navigation}) {
  const {login} = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    const validationError = validateLogin(username, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    const ok = await checkCredentials(username, password);
    if (!ok) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }
    setError(null);
    await login(username.trim()); // Al loguearse, la navegación cambia a Home.
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.logo}>✅</Text>
      <Text style={styles.title}>Gestor de Tareas</Text>
      <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

      <FormInput
        label="Usuario"
        placeholder="Tu usuario"
        value={username}
        onChangeText={setUsername}
      />
      <FormInput
        label="Contraseña"
        placeholder="Tu contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <CustomButton title="Ingresar" onPress={handleLogin} />
      <View style={styles.link}>
        <Button
          title="¿No tenés cuenta? Registrate"
          color={colors.primary}
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 28,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  link: {
    marginTop: 10,
  },
});
