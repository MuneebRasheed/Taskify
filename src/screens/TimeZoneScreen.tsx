import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import Button from '../components/Button';
import { timezones, timezonesByRegion, TimezoneInfo, getTimezoneLabel } from '../data/timezones';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../lib/auth/AuthProvider';
import * as Localization from 'expo-localization';

const TimeZoneScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Filter timezones based on search query
  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) {
      return timezonesByRegion;
    }

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, TimezoneInfo[]> = {};

    Object.keys(timezonesByRegion).forEach(region => {
      const matchingTimezones = timezonesByRegion[region].filter(
        tz =>
          tz.label.toLowerCase().includes(query) ||
          tz.offset.toLowerCase().includes(query) ||
          tz.value.toLowerCase().includes(query)
      );

      if (matchingTimezones.length > 0) {
        filtered[region] = matchingTimezones;
      }
    });

    return filtered;
  }, [searchQuery]);

  const handleAutoDetect = async () => {
    if (!user?.id) return;

    setIsDetecting(true);

    try {
      // Get device timezone using multiple methods
      let deviceTimezone = 'UTC';
      
      console.log('[Timezone Debug] Starting timezone detection...');
      
      try {
        const locales = Localization.getLocales();
        console.log('[Timezone Debug] Raw getLocales() result:', JSON.stringify(locales, null, 2));
        
        if (locales && locales.length > 0) {
          console.log('[Timezone Debug] First locale:', JSON.stringify(locales[0], null, 2));
          
          if (locales[0].timeZone) {
            deviceTimezone = locales[0].timeZone;
            console.log('[Timezone Debug] ✅ Detected from getLocales:', deviceTimezone);
          } else {
            console.log('[Timezone Debug] ❌ No timeZone in first locale');
          }
        } else {
          console.log('[Timezone Debug] ❌ getLocales returned empty array');
        }
      } catch (localizationError) {
        console.error('[Timezone Debug] ❌ Error with getLocales:', localizationError);
      }

      // If still UTC, try calendars
      if (deviceTimezone === 'UTC') {
        try {
          const calendars = Localization.getCalendars();
          console.log('[Timezone Debug] Raw getCalendars() result:', JSON.stringify(calendars, null, 2));
          
          if (calendars && calendars.length > 0 && calendars[0].timeZone) {
            deviceTimezone = calendars[0].timeZone;
            console.log('[Timezone Debug] ✅ Detected from getCalendars:', deviceTimezone);
          } else {
            console.log('[Timezone Debug] ❌ No timeZone in calendars');
          }
        } catch (calendarError) {
          console.error('[Timezone Debug] ❌ Error with getCalendars:', calendarError);
        }
      }

      // If still UTC, try Intl API
      if (deviceTimezone === 'UTC') {
        try {
          const intlTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          console.log('[Timezone Debug] Intl.DateTimeFormat timezone:', intlTimezone);
          
          if (intlTimezone && intlTimezone !== 'UTC') {
            deviceTimezone = intlTimezone;
            console.log('[Timezone Debug] ✅ Detected from Intl API:', deviceTimezone);
          } else {
            console.log('[Timezone Debug] ❌ Intl API returned UTC or null');
          }
        } catch (intlError) {
          console.error('[Timezone Debug] ❌ Error with Intl API:', intlError);
        }
      }

      console.log('[Timezone Debug] 🎯 Final detected timezone:', deviceTimezone);
      
      // Get user-friendly label for the alert
      const timezoneLabel = getTimezoneLabel(deviceTimezone);
      
      // Show alert with user-friendly timezone name
      alert(`Detected timezone: ${timezoneLabel}\n\nUpdating your profile and recalculating notifications...`);

      // Call backend API to update timezone and recalculate notifications
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.error('[Timezone] No auth token available');
        alert(t('somethingWentWrong'));
        setIsDetecting(false);
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/timezone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ timezone: deviceTimezone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Timezone] Failed to update timezone:', errorData);
        alert(t('somethingWentWrong'));
        setIsDetecting(false);
        return;
      }

      console.log('[Timezone] ✅ Successfully updated timezone and recalculated notifications');
      
      // Navigate back after a short delay
      setTimeout(() => {
        setIsDetecting(false);
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('[Timezone] Error auto-detecting timezone:', error);
      alert(t('somethingWentWrong'));
      setIsDetecting(false);
    }
  };

  const handleSelectTimezone = async (timezone: string) => {
    if (!user?.id) return;

    setSelectedTimezone(timezone);
    setIsUpdating(true);

    try {
      // Call backend API to update timezone and recalculate notifications
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.error('[Timezone] No auth token available');
        alert(t('somethingWentWrong'));
        setIsUpdating(false);
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/timezone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ timezone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Timezone] Failed to update timezone:', errorData);
        alert(t('somethingWentWrong'));
        setIsUpdating(false);
        return;
      }

      console.log('[Timezone] Successfully updated to:', timezone);
      
      // Navigate back after a short delay to show selection
      setTimeout(() => {
        setIsUpdating(false);
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('[Timezone] Error updating timezone:', error);
      alert(t('somethingWentWrong'));
      setIsUpdating(false);
    }
  };

  const regions = Object.keys(filteredTimezones).sort();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader title={t('timeZone')} onBack={() => navigation.goBack()} />

      <View style={styles.topSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchTimezone')}
            placeholderTextColor={lightColors.smallText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.autoDetectContainer}>
          <Button
            title={t('autoDetectTimezone')}
            onPress={handleAutoDetect}
            loading={isDetecting}
            disabled={isDetecting || isUpdating}
            style={styles.autoDetectButton}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {regions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('noTimezonesFound')}</Text>
          </View>
        ) : (
          regions.map(region => (
            <View key={region} style={styles.regionContainer}>
              <Text style={styles.regionTitle}>{region}</Text>
              {filteredTimezones[region].map(tz => (
                <TouchableOpacity
                  key={tz.value}
                  style={styles.timezoneItem}
                  onPress={() => handleSelectTimezone(tz.value)}
                  disabled={isUpdating || isDetecting}
                >
                  <View style={styles.timezoneInfo}>
                    <Text style={styles.timezoneLabel}>{tz.label}</Text>
                    <Text style={styles.timezoneOffset}>{tz.offset}</Text>
                  </View>
                  {isUpdating && selectedTimezone === tz.value && (
                    <ActivityIndicator size="small" color={lightColors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  topSection: {
    paddingBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  autoDetectContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  autoDetectButton: {
    backgroundColor: lightColors.accent,
    paddingVertical: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  regionContainer: {
    marginBottom: 24,
  },
  regionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.smallText,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timezoneItem: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  timezoneInfo: {
    flex: 1,
  },
  timezoneLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: lightColors.text,
    marginBottom: 4,
  },
  timezoneOffset: {
    fontSize: 14,
    color: lightColors.smallText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: lightColors.smallText,
    textAlign: 'center',
  },
});

export default TimeZoneScreen;
