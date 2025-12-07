import { useI18n } from '../contexts/I18nContext'
import './LanguageSelector.css'

interface LanguageSelectorProps {
  className?: string
  showLabel?: boolean
}

const LanguageSelector = ({ className = '', showLabel = false }: LanguageSelectorProps) => {
  const { language, setLanguage, availableLanguages } = useI18n()

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    ja: '日本語'
  }

  return (
    <div className={`language-selector ${className}`}>
      {showLabel && <label htmlFor="language-select">Language:</label>}
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="language-select"
        aria-label="Select language"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]} ({lang.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelector



