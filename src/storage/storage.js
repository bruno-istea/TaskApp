import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves usadas en AsyncStorage
const USERS_KEY = '@taskapp/users'; // { [username]: password }
const SESSION_KEY = '@taskapp/session'; // username logueado
const tasksKey = username => `@taskapp/tasks/${username}`; // tareas por usuario

// ---------- Usuarios ----------

async function getUsers() {
  const json = await AsyncStorage.getItem(USERS_KEY);
  return json ? JSON.parse(json) : {};
}

/** Registra un usuario. Devuelve un error (string) o null si salió bien. */
export async function registerUser(username, password) {
  const users = await getUsers();
  const user = username.trim();
  if (users[user]) {
    return 'Ese usuario ya existe.';
  }
  users[user] = password; // Nivel inicial: sin cifrado, como pide la consigna.
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return null;
}

/** Valida usuario y contraseña contra los datos guardados. */
export async function checkCredentials(username, password) {
  const users = await getUsers();
  return users[username.trim()] === password;
}

// ---------- Sesión ----------

export async function saveSession(username) {
  await AsyncStorage.setItem(SESSION_KEY, username);
}

export async function getSession() {
  return AsyncStorage.getItem(SESSION_KEY);
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// ---------- Tareas ----------

export async function getTasks(username) {
  const json = await AsyncStorage.getItem(tasksKey(username));
  return json ? JSON.parse(json) : [];
}

export async function saveTasks(username, tasks) {
  await AsyncStorage.setItem(tasksKey(username), JSON.stringify(tasks));
}
