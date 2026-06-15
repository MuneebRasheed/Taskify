// Comprehensive list of timezones grouped by region
export interface TimezoneInfo {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export const timezones: TimezoneInfo[] = [
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+2', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: 'UTC+2', region: 'Africa' },
  { value: 'Africa/Cape_Town', label: 'Cape Town', offset: 'UTC+2', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos', offset: 'UTC+1', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi', offset: 'UTC+3', region: 'Africa' },
  { value: 'Africa/Algiers', label: 'Algiers', offset: 'UTC+1', region: 'Africa' },
  { value: 'Africa/Casablanca', label: 'Casablanca', offset: 'UTC+1', region: 'Africa' },
  { value: 'Africa/Tunis', label: 'Tunis', offset: 'UTC+1', region: 'Africa' },
  { value: 'Africa/Accra', label: 'Accra', offset: 'UTC+0', region: 'Africa' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa', offset: 'UTC+3', region: 'Africa' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam', offset: 'UTC+3', region: 'Africa' },
  { value: 'Africa/Kampala', label: 'Kampala', offset: 'UTC+3', region: 'Africa' },
  
  // Americas
  { value: 'America/New_York', label: 'New York', offset: 'UTC-5', region: 'Americas' },
  { value: 'America/Chicago', label: 'Chicago', offset: 'UTC-6', region: 'Americas' },
  { value: 'America/Denver', label: 'Denver', offset: 'UTC-7', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles', offset: 'UTC-8', region: 'Americas' },
  { value: 'America/Anchorage', label: 'Anchorage', offset: 'UTC-9', region: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto', offset: 'UTC-5', region: 'Americas' },
  { value: 'America/Vancouver', label: 'Vancouver', offset: 'UTC-8', region: 'Americas' },
  { value: 'America/Mexico_City', label: 'Mexico City', offset: 'UTC-6', region: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', offset: 'UTC-3', region: 'Americas' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', offset: 'UTC-3', region: 'Americas' },
  { value: 'America/Santiago', label: 'Santiago', offset: 'UTC-3', region: 'Americas' },
  { value: 'America/Lima', label: 'Lima', offset: 'UTC-5', region: 'Americas' },
  { value: 'America/Bogota', label: 'Bogotá', offset: 'UTC-5', region: 'Americas' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai', offset: 'UTC+4', region: 'Asia' },
  { value: 'Asia/Kabul', label: 'Kabul', offset: 'UTC+4:30', region: 'Asia' },
  { value: 'Asia/Karachi', label: 'Islamabad (Pakistan)', offset: 'UTC+5', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Kolkata', offset: 'UTC+5:30', region: 'Asia' },
  { value: 'Asia/Dhaka', label: 'Dhaka', offset: 'UTC+6', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+9', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: 'UTC+7', region: 'Asia' },
  { value: 'Asia/Jakarta', label: 'Jakarta', offset: 'UTC+7', region: 'Asia' },
  { value: 'Asia/Manila', label: 'Manila', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Tehran', label: 'Tehran', offset: 'UTC+3:30', region: 'Asia' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem', offset: 'UTC+2', region: 'Asia' },
  { value: 'Asia/Riyadh', label: 'Riyadh', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Kuwait', label: 'Kuwait', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Muscat', label: 'Muscat', offset: 'UTC+4', region: 'Asia' },
  { value: 'Asia/Baku', label: 'Baku', offset: 'UTC+4', region: 'Asia' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi', offset: 'UTC+4', region: 'Asia' },
  { value: 'Asia/Yerevan', label: 'Yerevan', offset: 'UTC+4', region: 'Asia' },
  { value: 'Asia/Tashkent', label: 'Tashkent', offset: 'UTC+5', region: 'Asia' },
  { value: 'Asia/Almaty', label: 'Almaty', offset: 'UTC+6', region: 'Asia' },
  { value: 'Asia/Bishkek', label: 'Bishkek', offset: 'UTC+6', region: 'Asia' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu', offset: 'UTC+5:45', region: 'Asia' },
  { value: 'Asia/Colombo', label: 'Colombo', offset: 'UTC+5:30', region: 'Asia' },
  { value: 'Asia/Rangoon', label: 'Yangon', offset: 'UTC+6:30', region: 'Asia' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Taipei', label: 'Taipei', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Ulaanbaatar', label: 'Ulaanbaatar', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Vladivostok', label: 'Vladivostok', offset: 'UTC+10', region: 'Asia' },
  { value: 'Asia/Irkutsk', label: 'Irkutsk', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Yakutsk', label: 'Yakutsk', offset: 'UTC+9', region: 'Asia' },
  { value: 'Asia/Magadan', label: 'Magadan', offset: 'UTC+11', region: 'Asia' },
  { value: 'Asia/Baghdad', label: 'Baghdad', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Damascus', label: 'Damascus', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Beirut', label: 'Beirut', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Amman', label: 'Amman', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Nicosia', label: 'Nicosia', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Qatar', label: 'Qatar', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Bahrain', label: 'Bahrain', offset: 'UTC+3', region: 'Asia' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh', offset: 'UTC+7', region: 'Asia' },
  { value: 'Asia/Phnom_Penh', label: 'Phnom Penh', offset: 'UTC+7', region: 'Asia' },
  { value: 'Asia/Vientiane', label: 'Vientiane', offset: 'UTC+7', region: 'Asia' },
  
  // Europe
  { value: 'Europe/London', label: 'London', offset: 'UTC+0', region: 'Europe' },
  { value: 'Europe/Dublin', label: 'Dublin', offset: 'UTC+0', region: 'Europe' },
  { value: 'Europe/Lisbon', label: 'Lisbon', offset: 'UTC+0', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Brussels', label: 'Brussels', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Oslo', label: 'Oslo', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Warsaw', label: 'Warsaw', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Prague', label: 'Prague', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Budapest', label: 'Budapest', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: 'UTC+3', region: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul', offset: 'UTC+3', region: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens', offset: 'UTC+2', region: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki', offset: 'UTC+2', region: 'Europe' },
  { value: 'Europe/Bucharest', label: 'Bucharest', offset: 'UTC+2', region: 'Europe' },
  { value: 'Europe/Sofia', label: 'Sofia', offset: 'UTC+2', region: 'Europe' },
  { value: 'Europe/Kiev', label: 'Kyiv', offset: 'UTC+2', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich', offset: 'UTC+1', region: 'Europe' },
  
  // Pacific
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+12', region: 'Pacific' },
  { value: 'Pacific/Sydney', label: 'Sydney', offset: 'UTC+10', region: 'Pacific' },
  { value: 'Pacific/Melbourne', label: 'Melbourne', offset: 'UTC+10', region: 'Pacific' },
  { value: 'Pacific/Brisbane', label: 'Brisbane', offset: 'UTC+10', region: 'Pacific' },
  { value: 'Pacific/Perth', label: 'Perth', offset: 'UTC+8', region: 'Pacific' },
  { value: 'Pacific/Fiji', label: 'Fiji', offset: 'UTC+12', region: 'Pacific' },
  { value: 'Pacific/Honolulu', label: 'Honolulu', offset: 'UTC-10', region: 'Pacific' },
];

// Group timezones by region
export const timezonesByRegion = timezones.reduce((acc, tz) => {
  if (!acc[tz.region]) {
    acc[tz.region] = [];
  }
  acc[tz.region].push(tz);
  return acc;
}, {} as Record<string, TimezoneInfo[]>);

// Get timezone label for a given value
export const getTimezoneLabel = (value: string): string => {
  const tz = timezones.find(t => t.value === value);
  if (!tz) {
    // If timezone not found in our list, format the value nicely
    const parts = value.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return `${city} (${value})`;
  }
  return `${tz.label} (${tz.offset})`;
};

// Get current device timezone (fallback function)
export const getDeviceTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};
