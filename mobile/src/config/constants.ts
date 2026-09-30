export const DEFAULT_API_URL = 'https://yolda-mobile-app.onrender.com';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@yolda_auth_token',
  USER_DATA: '@yolda_user_data',
  API_URL_OVERRIDE: '@yolda_api_url_override',
};

export const RIDE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Sürücü Bekleniyor',
  ACCEPTED: 'Yolda / Kabul Edildi',
  COMPLETED: 'Yolculuk Tamamlandı',
  CANCELLED: 'İptal Edildi',
};

export const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Yolcu (Müşteri)',
  DRIVER: 'Sürücü (TAG Sürücüsü)',
};
