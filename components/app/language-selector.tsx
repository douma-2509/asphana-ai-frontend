'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/shadcn/utils';

export type LanguageCode = 'en' | 'som' | 'hi' | 'bn' | 'es';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'som', name: 'Somali', flag: '🇸🇴' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (languageCode: LanguageCode) => void;
  className?: string;
}

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  const selectedLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === value);

  return (
    <Select value={value} onValueChange={(val) => onChange(val as LanguageCode)}>
      <SelectTrigger className={cn('w-full justify-between rounded-lg px-4 py-3', className)}>
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{selectedLanguage?.flag}</span>
            <span>{selectedLanguage?.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
