import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja'

interface Translations {
  [key: string]: string | Translations
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  availableLanguages: Language[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  children: ReactNode
  defaultLanguage?: Language
  translations?: Record<Language, Translations>
}

const defaultTranslations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Try Again',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password'
    },
    interview: {
      title: 'Interview',
      start: 'Start Interview',
      end: 'End Interview',
      transcript: 'Transcript',
      evaluation: 'Evaluation'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      retry: 'Intentar de nuevo',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      reset: 'Restablecer'
    },
    auth: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      register: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer contraseña'
    },
    interview: {
      title: 'Entrevista',
      start: 'Iniciar entrevista',
      end: 'Finalizar entrevista',
      transcript: 'Transcripción',
      evaluation: 'Evaluación'
    }
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      retry: 'Réessayer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      reset: 'Réinitialiser'
    },
    auth: {
      login: 'Connexion',
      logout: 'Déconnexion',
      register: "S'inscrire",
      email: 'E-mail',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      resetPassword: 'Réinitialiser le mot de passe'
    },
    interview: {
      title: 'Entretien',
      start: 'Démarrer l\'entretien',
      end: 'Terminer l\'entretien',
      transcript: 'Transcription',
      evaluation: 'Évaluation'
    }
  },
  de: {
    common: {
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      retry: 'Erneut versuchen',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      filter: 'Filtern',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Zurück',
      submit: 'Absenden',
      reset: 'Zurücksetzen'
    },
    auth: {
      login: 'Anmelden',
      logout: 'Abmelden',
      register: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      resetPassword: 'Passwort zurücksetzen'
    },
    interview: {
      title: 'Interview',
      start: 'Interview starten',
      end: 'Interview beenden',
      transcript: 'Transkript',
      evaluation: 'Bewertung'
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      filter: '筛选',
      close: '关闭',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      submit: '提交',
      reset: '重置'
    },
    auth: {
      login: '登录',
      logout: '登出',
      register: '注册',
      email: '电子邮件',
      password: '密码',
      forgotPassword: '忘记密码？',
      resetPassword: '重置密码'
    },
    interview: {
      title: '面试',
      start: '开始面试',
      end: '结束面试',
      transcript: '转录',
      evaluation: '评估'
    }
  },
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      create: '作成',
      search: '検索',
      filter: 'フィルター',
      close: '閉じる',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      submit: '送信',
      reset: 'リセット'
    },
    auth: {
      login: 'ログイン',
      logout: 'ログアウト',
      register: '登録',
      email: 'メール',
      password: 'パスワード',
      forgotPassword: 'パスワードを忘れた場合',
      resetPassword: 'パスワードをリセット'
    },
    interview: {
      title: '面接',
      start: '面接を開始',
      end: '面接を終了',
      transcript: '転写',
      evaluation: '評価'
    }
  }
}

export const I18nProvider = ({
  children,
  defaultLanguage = 'en',
  translations = defaultTranslations
}: I18nProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language
    return saved && Object.keys(defaultTranslations).includes(saved) ? saved : defaultLanguage
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.setAttribute('lang', lang)
  }

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.')
      let value: any = translations[language]

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          // Fallback to English if translation not found
          value = translations.en
          for (const fallbackKey of keys) {
            if (value && typeof value === 'object' && fallbackKey in value) {
              value = value[fallbackKey]
            } else {
              return key
            }
          }
          break
        }
      }

      if (typeof value !== 'string') {
        return key
      }

      // Replace parameters
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, val]) => str.replace(`{{${param}}}`, String(val)),
          value
        )
      }

      return value
    }
  }, [language, translations])

  const availableLanguages: Language[] = Object.keys(defaultTranslations) as Language[]

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  )
}

