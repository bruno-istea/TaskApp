import {
  countPending,
  formatTime,
  validateLogin,
  validateRegister,
  validateTask,
} from '../src/utils/validation';

describe('validateRegister (lógica de negocio)', () => {
  it('acepta datos válidos', () => {
    expect(validateRegister('bruno', '1234', '1234')).toBeNull();
  });

  it('rechaza campos vacíos', () => {
    expect(validateRegister('', '', '')).toBe('Completá usuario y contraseña.');
  });

  it('rechaza usuario corto o con espacios', () => {
    expect(validateRegister('ab', '1234', '1234')).toMatch(/al menos 3/);
    expect(validateRegister('bru no', '1234', '1234')).toMatch(/espacios/);
  });

  it('rechaza contraseña corta o que no coincide', () => {
    expect(validateRegister('bruno', '12', '12')).toMatch(/al menos 4/);
    expect(validateRegister('bruno', '1234', '9999')).toBe(
      'Las contraseñas no coinciden.',
    );
  });
});

describe('validateLogin', () => {
  it('exige usuario y contraseña', () => {
    expect(validateLogin('', '1234')).not.toBeNull();
    expect(validateLogin('bruno', '1234')).toBeNull();
  });
});

describe('validateTask', () => {
  it('rechaza un título vacío o solo con espacios', () => {
    expect(validateTask('   ')).toBe('La tarea necesita un título.');
  });

  it('acepta un título normal', () => {
    expect(validateTask('Comprar pan')).toBeNull();
  });
});

describe('formatTime y countPending', () => {
  it('formatea la hora como HH:MM', () => {
    const date = new Date(2026, 9, 4, 9, 5);
    expect(formatTime(date.getTime())).toBe('09:05');
  });

  it('cuenta solo las tareas pendientes', () => {
    const tasks = [{done: false}, {done: true}, {done: false}];
    expect(countPending(tasks)).toBe(2);
  });
});
