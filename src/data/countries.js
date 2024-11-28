export const countries = [
  { code: 'US', name: 'United States', dial_code: '+1' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44' },
  { code: 'IN', name: 'India', dial_code: '+91' },
  { code: 'CN', name: 'China', dial_code: '+86' },
  { code: 'JP', name: 'Japan', dial_code: '+81' },
  { code: 'DE', name: 'Germany', dial_code: '+49' },
  { code: 'FR', name: 'France', dial_code: '+33' },
  { code: 'IT', name: 'Italy', dial_code: '+39' },
  { code: 'BR', name: 'Brazil', dial_code: '+55' },
  { code: 'RU', name: 'Russia', dial_code: '+7' },
  { code: 'CA', name: 'Canada', dial_code: '+1' },
  { code: 'AU', name: 'Australia', dial_code: '+61' },
  { code: 'KR', name: 'South Korea', dial_code: '+82' },
  { code: 'ES', name: 'Spain', dial_code: '+34' },
  { code: 'MX', name: 'Mexico', dial_code: '+52' },
  { code: 'ID', name: 'Indonesia', dial_code: '+62' },
  { code: 'NL', name: 'Netherlands', dial_code: '+31' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966' },
  { code: 'TR', name: 'Turkey', dial_code: '+90' },
  { code: 'CH', name: 'Switzerland', dial_code: '+41' }
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by country name