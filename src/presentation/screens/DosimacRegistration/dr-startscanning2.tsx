// DRstartscanningScreen.tsx
import React from 'react';
import { View, Pressable, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

// Librería BLE unificada
import * as ble from '../../../device/ble/bleLibrary';

// 👇 Antes usábamos esto para leer manufacturerData, ahora ya no lo necesitamos
// import { startWatchAdvertisements } from '../../../device/ble/bleLibrary.web';

export const DRstartscanningScreen = ({ navigation, route }: any) => {
   const { t } = useTranslation();
   const { width } = useWindowDimensions();
   const isWeb = Platform.OS === 'web';

   // helpers
   const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

   // Tamaño del botón
   const btnSize = isWeb ? clamp(width * 0.25, 220, 340) : clamp(width * 0.45, 140, 200);
   const fontSize = Math.round(btnSize * 0.16);
   const cardWidth = isWeb ? clamp(width * 0.6, 360, 640) : '90%';

   const [pressed, setPressed] = React.useState(false);

   const operacion = route?.params?.operacion;

   const handlePress = async () => {
      if (pressed) return;
      setPressed(true);

      if (Platform.OS === 'web') {
         try {
            ble.BleStart?.();
            ble.bleAddListener?.();

            console.log('[DRstart][web] startScanning…');
            const dev = await ble.startScanning?.("dosimac");

            if (!dev) {
               console.log('[DRstart][web] Usuario canceló el selector BLE');
               setPressed(false);
               return;
            }

            console.log('[DRstart][web] seleccionado', dev.id, dev.name ?? null);
            console.log('[DRstart][web] navegando a DR-SETUP (ya debería estar conectado)');

            // Ya NO llamamos a bleConnection aquí
            navigation.navigate('DR-SETUP', {
               id: dev.id,
               operacion,
            });

         } catch (e: any) {
            if (e?.name === 'NotFoundError') {
               console.log('[DRstart][web] Usuario cerró el chooser sin elegir nada');
            } else {
               console.error('[DRstart][web] Web scan error:', e);
            }
         } finally {
            setPressed(false);
         }
      } else {
         // 🔹 NATIVO (Android / iOS): flujo antiguo con DR-SCANRESULTS
         try {
            ble.BleStart?.();
            ble.bleAddListener?.();
            ble.startScanning?.();
            navigation.navigate('DR-SCANRESULTS', {
               operacion,
               webScan: false,
               lastId: null,
            });
         } finally {
            setPressed(false);
         }
      }
   };

   return (
      <View style={styles.page}>
         <Appbar.Header elevated>
            <Appbar.BackAction onPress={navigation.goBack} />
            <Appbar.Content title={t('common:StartScan')} />
         </Appbar.Header>

         <View style={styles.body}>
            {/* Tarjeta de instrucciones centrada */}
            <Card mode="contained" style={[styles.card, { width: cardWidth }]}>
               <Card.Content>
                  <Text variant="titleMedium" style={styles.cardText}>
                     {t('common:TestoPresioneAlta')}
                  </Text>
               </Card.Content>
            </Card>

            {/* Botón redondo */}
            <Pressable
               onPress={handlePress}
               style={[
                  styles.circle,
                  {
                     width: btnSize,
                     height: btnSize,
                     borderRadius: btnSize / 2,
                     opacity: pressed ? 0.7 : 1,
                  },
               ]}
            >
               <Text style={[styles.circleText, { fontSize }]}>
                  {t('common:PressToScan')}
               </Text>
            </Pressable>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   page: { flex: 1, backgroundColor: '#F3F5F8' },
   body: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 24,
      gap: 28,
   },
   card: {
      alignSelf: 'center',
      borderRadius: 14,
      backgroundColor: '#F2ECFB',
      borderWidth: 1,
      borderColor: '#E6DDF7',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
   },
   cardText: { textAlign: 'center', fontWeight: '600' },
   circle: {
      backgroundColor: '#0F746F',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
   },
   circleText: { color: '#FFF7D6', fontWeight: '800' },
});
