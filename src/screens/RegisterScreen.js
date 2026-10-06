import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import {registerUser} from '../storage/storage';
import {colors} from '../theme';
import {validateRegister} from '../utils/validation';

export default function RegisterScreen({navigation}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    const validationError = validateRegister(username, password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    const storageError = await registerUser(username, password);
    if (storageError) {
      setError(storageError);
      return;
    }
    setError(null);
    Alert.alert('¡Listo!', 'Usuario creado. Ahora podés iniciar sesión.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <FormInput
        label="Usuario"
        placeholder="Mínimo 3 caracteres"
        value={username}
        onChangeText={setUsername}
      />
      <FormInput
        label="Contraseña"
        placeholder="Mínimo 4 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormInput
        label="Repetir contraseña"
        placeholder="Repetí la contraseña"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <CustomButton title="Registrarme" onPress={handleRegister} />
      <CustomButton
        title="Ya tengo cuenta"
        variant="outline"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
});
