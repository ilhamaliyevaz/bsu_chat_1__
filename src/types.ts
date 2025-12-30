export type Bindings = {
  DB: D1Database;
}

export type Faculty = 
  | 'Mexanika-riyaziyyat fakültəsi'
  | 'Tətbiqi riyaziyyat və kibernetika fakültəsi'
  | 'Fizika fakültəsi'
  | 'Kimya fakültəsi'
  | 'Biologiya fakültəsi'
  | 'Ekologiya və torpaqşünaslıq fakültəsi'
  | 'Coğrafiya fakültəsi'
  | 'Geologiya fakültəsi'
  | 'Filologiya fakültəsi'
  | 'Tarix fakültəsi'
  | 'Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi'
  | 'Hüquq fakültəsi'
  | 'Jurnalistika fakültəsi'
  | 'İnformasiya və sənəd menecmenti fakültəsi'
  | 'Şərqşünaslıq fakültəsi'
  | 'Sosial elmlər və psixologiya fakültəsi';

export const FACULTIES: Faculty[] = [
  'Mexanika-riyaziyyat fakültəsi',
  'Tətbiqi riyaziyyat və kibernetika fakültəsi',
  'Fizika fakültəsi',
  'Kimya fakültəsi',
  'Biologiya fakültəsi',
  'Ekologiya və torpaqşünaslıq fakültəsi',
  'Coğrafiya fakültəsi',
  'Geologiya fakültəsi',
  'Filologiya fakültəsi',
  'Tarix fakültəsi',
  'Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi',
  'Hüquq fakültəsi',
  'Jurnalistika fakültəsi',
  'İnformasiya və sənəd menecmenti fakültəsi',
  'Şərqşünaslıq fakültəsi',
  'Sosial elmlər və psixologiya fakültəsi'
];

export const VERIFICATION_QUESTIONS = [
  { question: 'Mexanika-riyaziyyat fakültəsi hansı korpusda yerləşir?', answer: '3' },
  { question: 'Tətbiqi riyaziyyat və kibernetika fakültəsi hansı korpusda yerləşir?', answer: '3' },
  { question: 'Fizika fakültəsi hansı korpusda yerləşir?', answer: 'əsas' },
  { question: 'Kimya fakültəsi hansı korpusda yerləşir?', answer: 'əsas' },
  { question: 'Biologiya fakültəsi hansı korpusda yerləşir?', answer: 'əsas' },
  { question: 'Ekologiya və torpaqşünaslıq fakültəsi hansı korpusda yerləşir?', answer: 'əsas' },
  { question: 'Coğrafiya fakültəsi hansı korpusda yerləşir?', answer: 'əsas' },
  { question: 'Geologiya fakültəsi hansı korpusda yerləşir?', answer: 'əsas' },
  { question: 'Filologiya fakültəsi hansı korpusda yerləşir?', answer: '1' },
  { question: 'Tarix fakültəsi hansı korpusda yerləşir?', answer: '3' },
  { question: 'Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi hansı korpusda yerləşir?', answer: '1' },
  { question: 'Hüquq fakültəsi hansı korpusda yerləşir?', answer: '1' },
  { question: 'Jurnalistika fakültəsi hansı korpusda yerləşir?', answer: '2' },
  { question: 'İnformasiya və sənəd menecmenti fakültəsi hansı korpusda yerləşir?', answer: '2' },
  { question: 'Şərqşünaslıq fakültəsi hansı korpusda yerləşir?', answer: '2' },
  { question: 'Sosial elmlər və psixologiya fakültəsi hansı korpusda yerləşir?', answer: '2' }
];

export interface User {
  id: number;
  email: string;
  phone: string;
  password: string;
  full_name: string;
  faculty: Faculty;
  course: number;
  profile_image?: string;
  is_banned: number;
  created_at: string;
}

export interface Message {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
  user?: {
    full_name: string;
    profile_image?: string;
  };
}
