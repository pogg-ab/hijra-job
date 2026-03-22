import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        jobs: 'Jobs',
        services: 'Services',
        contact: 'Contact',
        login: 'Login',
        signup: 'Sign Up',
      },
      services: {
        title: 'Our Services',
        intro: 'HIJRA FOREIGN EMPLOYMENT AGENCY PLC provides trusted recruitment services to connect Ethiopian talent with global employers.',
        loading: 'Loading services...',
        none: 'No services found.'
      },
      dashboard: {
        welcome_back: 'Welcome back',
        overview: "Here's an overview of your job search progress",
        my_applications: 'My Applications',
        browse_more_jobs: '+ Browse More Jobs',
        applied: 'Applied',
        last_update: 'Last update',
        view_details: 'View Details',
        accept: 'Accept',
        ask_rearrange: 'Ask to rearrange',
        send_proposal: 'Send proposal',
        enter_datetime: 'Enter date/time',
        invalid_datetime: 'Invalid date/time'
      },
      common: {
        welcome_back: 'Welcome Back',
        sign_in_to_account: 'Sign in to your Hijra account',
        email_address: 'Email Address',
        password: 'Password',
        forgot_password: 'Forgot password?',
        remember_me: 'Remember me',
        signing_in: 'Signing in...',
        sign_in: 'Sign In',
        dont_have_account: "Don't have an account?",
        sign_up_here: 'Sign up here',
        partner_register_prompt: 'Partner agency? Register from the partner registration page:',
      },
      footer: {
        company_para: 'Connecting Ethiopian professionals with global employment opportunities. Building careers, changing lives.',
        for_job_seekers: 'For Job Seekers',
        browse_jobs: 'Browse Jobs',
        create_profile: 'Create Profile',
        my_dashboard: 'My Dashboard',
        how_it_works: 'How It Works',
        for_employers: 'For Employers',
        post_jobs: 'Post Jobs',
        employer_dashboard: 'Employer Dashboard',
        pricing: 'Pricing',
        features: 'Features',
        support: 'Support',
        contact_us: 'Contact Us',
        faqs: 'FAQs',
        privacy_policy: 'Privacy Policy',
        terms_of_service: 'Terms of Service',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        facebook: 'Facebook',
      }
    },
  },
  am: {
    translation: {
      nav: {
        home: 'መነሻ',
        jobs: 'ስራዎች',
        services: 'አገልግሎቶች',
        contact: 'ያግኙን',
        login: 'ግባ',
        signup: 'ይመዝገቡ',
      },
      common: {
        welcome_back: 'Welcome Back',
        sign_in_to_account: 'Sign in to your Hijra account',
        email_address: 'Email Address',
        password: 'Password',
        forgot_password: 'Forgot password?',
        remember_me: 'Remember me',
        signing_in: 'Signing in...',
        sign_in: 'Sign In',
        dont_have_account: "Don't have an account?",
        sign_up_here: 'Sign up here',
        partner_register_prompt: 'Partner agency? Register from the partner registration page:',
      },
      footer: {
        company_para: 'Connecting Ethiopian professionals with global employment opportunities. Building careers, changing lives.',
        for_job_seekers: 'For Job Seekers',
        browse_jobs: 'Browse Jobs',
        create_profile: 'Create Profile',
        my_dashboard: 'My Dashboard',
        how_it_works: 'How It Works',
        for_employers: 'For Employers',
        post_jobs: 'Post Jobs',
        employer_dashboard: 'Employer Dashboard',
        pricing: 'Pricing',
        features: 'Features',
        support: 'Support',
        contact_us: 'Contact Us',
        faqs: 'FAQs',
        privacy_policy: 'Privacy Policy',
        terms_of_service: 'Terms of Service',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        facebook: 'Facebook',
      }
    },
  },
  ar: {
    translation: {
      nav: {
        home: 'الرئيسية',
        jobs: 'الوظائف',
        services: 'الخدمات',
        contact: 'اتصل بنا',
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
      },
      common: {
        welcome_back: 'Welcome Back',
        sign_in_to_account: 'Sign in to your Hijra account',
        email_address: 'Email Address',
        password: 'Password',
        forgot_password: 'Forgot password?',
        remember_me: 'Remember me',
        signing_in: 'Signing in...',
        sign_in: 'Sign In',
        dont_have_account: "Don't have an account?",
        sign_up_here: 'Sign up here',
        partner_register_prompt: 'Partner agency? Register from the partner registration page:',
      },
      footer: {
        company_para: 'Connecting Ethiopian professionals with global employment opportunities. Building careers, changing lives.',
        for_job_seekers: 'For Job Seekers',
        browse_jobs: 'Browse Jobs',
        create_profile: 'Create Profile',
        my_dashboard: 'My Dashboard',
        how_it_works: 'How It Works',
        for_employers: 'For Employers',
        post_jobs: 'Post Jobs',
        employer_dashboard: 'Employer Dashboard',
        pricing: 'Pricing',
        features: 'Features',
        support: 'Support',
        contact_us: 'Contact Us',
        faqs: 'FAQs',
        privacy_policy: 'Privacy Policy',
        terms_of_service: 'Terms of Service',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        facebook: 'Facebook',
      }
    },
  },
  or: {
    translation: {
      nav: {
        home: 'Mana',
        jobs: 'Hojiiwwan',
        services: 'Tajaajiloota',
        contact: 'Nu Qunnamaa',
        login: 'Seeni',
        signup: 'Galmaa’i',
      },
      common: {
        welcome_back: 'Welcome Back',
        sign_in_to_account: 'Sign in to your Hijra account',
        email_address: 'Email Address',
        password: 'Password',
        forgot_password: 'Forgot password?',
        remember_me: 'Remember me',
        signing_in: 'Signing in...',
        sign_in: 'Sign In',
        dont_have_account: "Don't have an account?",
        sign_up_here: 'Sign up here',
        partner_register_prompt: 'Partner agency? Register from the partner registration page:',
      },
      footer: {
        company_para: 'Connecting Ethiopian professionals with global employment opportunities. Building careers, changing lives.',
        for_job_seekers: 'For Job Seekers',
        browse_jobs: 'Browse Jobs',
        create_profile: 'Create Profile',
        my_dashboard: 'My Dashboard',
        how_it_works: 'How It Works',
        for_employers: 'For Employers',
        post_jobs: 'Post Jobs',
        employer_dashboard: 'Employer Dashboard',
        pricing: 'Pricing',
        features: 'Features',
        support: 'Support',
        contact_us: 'Contact Us',
        faqs: 'FAQs',
        privacy_policy: 'Privacy Policy',
        terms_of_service: 'Terms of Service',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        facebook: 'Facebook',
      }
    },
  },
} as const

export const SUPPORTED_LANGUAGES = ['en', 'am', 'ar', 'or'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const RTL_LANGUAGES: AppLanguage[] = ['ar']

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
}

export default i18n