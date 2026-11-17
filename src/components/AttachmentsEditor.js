import React, {useState} from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from './CustomButton';
import SectionCard from './SectionCard';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCurrentLocation,
  pickContact,
  pickImage,
  takePhoto,
} from '../services/device';
import {colors} from '../theme';
import {
  EVENT_OPTIONS,
  eventStartFor,
  formatCoords,
  formatDateTime,
  mapsUrl,
} from '../utils/format';

/**
 * Editor de los "adjuntos" de una tarea (componente reutilizable):
 * foto, ubicación, responsable (contacto) y evento en el calendario.
 * Se usa en "Nueva tarea" y en "Detalle de la tarea".
 *
 * Props:
 * - title: título de la tarea (se usa para el evento del calendario)
 * - value: {photoUri, location, contact, calendarEvent}
 * - onChange(cambios): avisa qué campos cambiaron
 */
export default function AttachmentsEditor({title, value, onChange}) {
  const [busy, setBusy] = useState(null); // qué acción está en curso
  const [manualAddress, setManualAddress] = useState(null);
  const [manualContact, setManualContact] = useState(null);
  const [eventOption, setEventOption] = useState('1h');

  // Ejecuta una acción mostrando "cargando" y avisa si algo falla.
  const run = async (key, action) => {
    setBusy(key);
    try {
      await action();
    } catch (e) {
      Alert.alert('Algo salió mal', e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  // ---------- Foto ----------
  const handleCamera = () =>
    run('photo', async () => {
      const uri = await takePhoto();
      if (uri) onChange({photoUri: uri});
    });

  const handleGallery = () =>
    run('photo', async () => {
      const uri = await pickImage();
      if (uri) onChange({photoUri: uri});
    });

  // ---------- Ubicación ----------
  const handleLocation = () =>
    run('location', async () => {
      const location = await getCurrentLocation();
      if (location) onChange({location});
    });

  const saveManualAddress = () => {
    const address = (manualAddress || '').trim();
    if (address) {
      onChange({location: {latitude: null, longitude: null, address}});
    }
    setManualAddress(null);
  };

  // ---------- Contacto ----------
  const handleContact = () =>
    run('contact', async () => {
      const contact = await pickContact();
      if (contact) onChange({contact});
    });

  const saveManualContact = () => {
    const name = (manualContact || '').trim();
    if (name) {
      onChange({contact: {id: null, name, phone: null}});
    }
    setManualContact(null);
  };

  // ---------- Calendario ----------
  const handleCalendar = () => {
    if (!(title || '').trim()) {
      Alert.alert('Falta el título', 'Escribí el título de la tarea primero.');
      return;
    }
    run('calendar', async () => {
      const event = await createCalendarEvent({
        title: title.trim(),
        startDate: eventStartFor(eventOption),
        location: value.location?.address,
      });
      if (event) {
        onChange({calendarEvent: event});
        Alert.alert(
          'Listo',
          'La tarea se agendó en el calendario del celular.',
        );
      }
    });
  };

  const removeCalendar = () =>
    run('calendar', async () => {
      await deleteCalendarEvent(value.calendarEvent?.id);
      onChange({calendarEvent: null});
    });

  const {photoUri, location, contact, calendarEvent} = value;

  return (
    <View>
      {/* ---------- FOTO ---------- */}
      <SectionCard icon="📷" title="Foto">
        {photoUri ? (
          <Image
            testID="attachment-photo"
            source={{uri: photoUri}}
            style={styles.photo}
          />
        ) : (
          <Text style={styles.empty}>Sin foto</Text>
        )}
        <View style={styles.row}>
          <CustomButton
            title="Cámara"
            variant="outline"
            onPress={handleCamera}
            disabled={busy === 'photo'}
            style={styles.half}
          />
          <CustomButton
            title="Galería"
            variant="outline"
            onPress={handleGallery}
            disabled={busy === 'photo'}
            style={styles.half}
          />
        </View>
        {photoUri && (
          <Text style={styles.link} onPress={() => onChange({photoUri: null})}>
            Quitar foto
          </Text>
        )}
      </SectionCard>

      {/* ---------- UBICACIÓN ---------- */}
      <SectionCard icon="📍" title="Lugar de la tarea">
        {location ? (
          <View>
            <Text style={styles.value}>
              {location.address ?? 'Dirección no disponible'}
            </Text>
            {location.latitude != null && (
              <>
                <Text style={styles.small}>
                  {formatCoords(location.latitude, location.longitude)}
                </Text>
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL(
                      mapsUrl(location.latitude, location.longitude),
                    )
                  }>
                  Ver en el mapa
                </Text>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.empty}>Sin ubicación</Text>
        )}

        {manualAddress !== null ? (
          <ManualInput
            placeholder="Ej: Av. Mitre 123, Quilmes"
            value={manualAddress}
            onChangeText={setManualAddress}
            onSave={saveManualAddress}
          />
        ) : (
          <>
            <CustomButton
              title={
                busy === 'location' ? 'Buscando...' : 'Usar mi ubicación actual'
              }
              variant="outline"
              onPress={handleLocation}
              disabled={busy === 'location'}
            />
            <Text style={styles.link} onPress={() => setManualAddress('')}>
              O escribir la dirección a mano
            </Text>
          </>
        )}
      </SectionCard>

      {/* ---------- CONTACTO ---------- */}
      <SectionCard icon="👤" title="Responsable">
        {contact ? (
          <View>
            <Text style={styles.value}>{contact.name}</Text>
            {contact.phone && (
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}>
                📞 {contact.phone}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.empty}>Sin responsable</Text>
        )}

        {manualContact !== null ? (
          <ManualInput
            placeholder="Nombre del responsable"
            value={manualContact}
            onChangeText={setManualContact}
            onSave={saveManualContact}
          />
        ) : (
          <>
            <CustomButton
              title="Elegir de mis contactos"
              variant="outline"
              onPress={handleContact}
              disabled={busy === 'contact'}
            />
            <Text style={styles.link} onPress={() => setManualContact('')}>
              O escribir el nombre a mano
            </Text>
          </>
        )}
      </SectionCard>

      {/* ---------- CALENDARIO ---------- */}
      <SectionCard icon="📅" title="Calendario">
        {calendarEvent ? (
          <View>
            <Text style={styles.value}>
              Agendada para el {formatDateTime(calendarEvent.startDate)}
            </Text>
            <Text style={styles.link} onPress={removeCalendar}>
              Quitar del calendario
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.chips}>
              {EVENT_OPTIONS.map(opt => {
                const selected = opt.key === eventOption;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setEventOption(opt.key)}
                    style={[styles.chip, selected && styles.chipSelected]}>
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <CustomButton
              title={
                busy === 'calendar' ? 'Agendando...' : 'Agregar al calendario'
              }
              variant="outline"
              onPress={handleCalendar}
              disabled={busy === 'calendar'}
            />
          </>
        )}
      </SectionCard>
    </View>
  );
}

/** Campo de texto con botón "Guardar" (alternativa manual si no hay permiso). */
function ManualInput({placeholder, value, onChangeText, onSave}) {
  return (
    <View style={styles.manualRow}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        autoFocus
      />
      <CustomButton title="Guardar" onPress={onSave} style={styles.save} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  empty: {
    color: colors.muted,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  small: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
    paddingVertical: 4,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  save: {
    paddingHorizontal: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: 8,
    marginBottom: 6,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
