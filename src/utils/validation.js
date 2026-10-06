// Lógica de negocio pura (sin React), fácil de testear con Jest.

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 4;

/**
 * Valida los datos del formulario de registro.
 * Devuelve un string con el error, o null si todo está bien.
 */
export function validateRegister(username, password, confirmPassword) {
  const user = (username || '').trim();
  if (!user || !password) {
    return 'Completá usuario y contraseña.';
  }
  if (user.length < MIN_USERNAME_LENGTH) {
    return `El usuario debe tener al menos ${MIN_USERNAME_LENGTH} caracteres.`;
  }
  if (/\s/.test(user)) {
    return 'El usuario no puede tener espacios.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
}

/**
 * Valida los datos del formulario de login.
 */
export function validateLogin(username, password) {
  if (!(username || '').trim() || !password) {
    return 'Completá usuario y contraseña.';
  }
  return null;
}

/**
 * Valida el título de una tarea nueva.
 */
export function validateTask(title) {
  const t = (title || '').trim();
  if (!t) {
    return 'La tarea necesita un título.';
  }
  if (t.length > 60) {
    return 'El título no puede superar los 60 caracteres.';
  }
  return null;
}

/**
 * Formatea un timestamp como "HH:MM" para mostrar la hora del recordatorio.
 */
export function formatTime(timestamp) {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Devuelve cuántas tareas quedan pendientes.
 */
export function countPending(tasks) {
  return tasks.filter(t => !t.done).length;
}
