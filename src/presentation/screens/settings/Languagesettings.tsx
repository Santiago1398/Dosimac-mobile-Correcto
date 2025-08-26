/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { t } from 'i18next';
import { DefaultTheme, useNavigation } from '@react-navigation/native';

const languages = [
	{ code: 'en', label: t('language:english') },
	{ code: 'es', label: t('language:spanish') },
];

// type Props = StackScreenProps<MainStackTypeParamList, 'SETTINGS_SCREEN'>;



export const LanguageSettingsScreen = () => {
	// export const LanguageSettingsScreen = ({ navigation}: Props) => {
	const { t, i18n } = useTranslation();
	const [lang, changeLang] = useState('en');
	const selectedLanguageCode = i18n.language;

	const navigation = useNavigation();


	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			headerTitle: t('navigate:settings'),
		});
		return () => { };
	}, [navigation, lang]);

	return (
		<View>
			<Text style={styles.language}> {t('common:change_language')}</Text>
			{languages.map((currentLang, i) => {
				const selectedLanguage = currentLang.code === selectedLanguageCode;
				return (
					<Text
						key={i}
						onPress={() => {
							changeLang(currentLang.code);
							i18n.changeLanguage(currentLang.code);
						}}
						style={{
							color: selectedLanguage ? DefaultTheme.colors.primary : '#000000',
							padding: 10,
							fontSize: 18,
							fontWeight: selectedLanguage ? 'bold' : 'normal',
						}}>
						{currentLang.label}
					</Text>
				);
			})}
		</View>
	);
};


const styles = StyleSheet.create({
	language: {
		paddingTop: 10,
		textAlign: 'center',
	},
});