/* eslint-disable prettier/prettier */
import { StyleSheet } from 'react-native';

/**
 * Palette centralizada.  El `as const` hace que cada clave sea un literal
 * (`'primary' | 'secondary' | …`) y cada valor un string inmutable, lo que
 * permite a TypeScript detectar typos de inmediato.
 */
export const globalColors = {
   primary: '#3f0baf',
   secondary: '#f72585',      // <— corregido “sercondary” → "secondary"
   tertiary: '#3a0ca3',       // <— corregido “terciary”  → "tertiary"
   success: '#4cc9f0',
   warning: '#fca311',
   danger: '#e71d36',
   dark: '#22223b',
   background: '#ffffff',
} as const;

export type GlobalColorName = keyof typeof globalColors;
export type GlobalColor = (typeof globalColors)[GlobalColorName];

/**
 * Estilos de uso frecuente agrupados por dominio.
 */
export const globalStyles = StyleSheet.create({
   row: {
      paddingHorizontal: 40,
      gap: 20,
      marginVertical: 60,
      width: '100%',
   },
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: globalColors.background,
   },
   primaryButton: {
      backgroundColor: globalColors.primary,
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      width: '100%',
      alignItems: 'center',
   },
   buttonText: {
      color: globalColors.background,
      fontSize: 18,
   },
   primaryText: {
      color: globalColors.dark,
      fontSize: 18,
      backgroundColor: globalColors.warning,
      padding: 20,
      borderRadius: 10,
      marginBottom: 10,
   },
});

export const globalFonts = {
   primary: 'Roboto-Regular',
   secondary: 'Roboto-Light',
   tertiary: 'Roboto-Bold',   // corregido
   quaternary: 'Roboto-Thin',
   quinary: 'Roboto-Black',
   senary: 'Roboto-Medium',
   septenary: 'Roboto-Italic',
   octonary: 'Roboto-BlackItalic',
   nonary: 'Roboto-BoldItalic',
   denary: 'Roboto-LightItalic',
   undenary: 'Roboto-MediumItalic',
   duodenary: 'Roboto-ThinItalic',
} as const;

/**
 * Estilos generados para pantallas.
 */
export const genStyles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: globalColors.background,
   },
   button: {
      padding: 10,
   },
   title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: globalColors.primary,
      marginBottom: 10,
   },
   subtitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: globalColors.primary,
      marginBottom: 10,
   },
   text: {
      fontSize: 16,
      color: globalColors.primary,
      marginBottom: 10,
   },
   textBold: {
      fontSize: 16,
      fontWeight: 'bold',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textItalic: {
      fontSize: 16,
      fontStyle: 'italic',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textBoldItalic: {
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textSmall: {
      fontSize: 12,
      color: globalColors.primary,
      marginBottom: 10,
   },
   textSmallBold: {
      fontSize: 12,
      fontWeight: 'bold',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textSmallItalic: {
      fontSize: 12,
      fontStyle: 'italic',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textSmallBoldItalic: {
      fontSize: 12,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textLarge: {
      fontSize: 20,
      color: globalColors.primary,
      marginBottom: 10,
   },
   textLargeBold: {
      fontSize: 20,
      fontWeight: 'bold',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textLargeItalic: {
      fontSize: 20,
      fontStyle: 'italic',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textLargeBoldItalic: {
      fontSize: 20,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: globalColors.primary,
      marginBottom: 10,
   },
   textExtraLarge: {
      fontSize: 24,
      color: globalColors.primary,
      marginBottom: 10,
   },
   textExtraLargeBold: {
      fontSize: 24,
      fontWeight: 'bold',
      color: globalColors.primary,  // corregido: antes era el objeto entero
      marginBottom: 10,
   },
});
