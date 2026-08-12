export interface NhaCoCong {
  id: string;
  nha_cua_ai: string;
  ten_liet_si: string;
  ngay_sinh?: string;
  ngay_mat?: string;
  que_quan?: string;
  tieu_su?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface TuyenDuong {
  id: string;
  name: string;
  description?: string;
  ngay_sinh?: string;
  ngay_mat?: string;
  que_quan?: string;
  color?: string;
  points: [number, number][];
  images?: string[];
}

export interface AreaMetadata {
  bg_music_url?: string;
  nha_co_cong?: NhaCoCong[];
  tuyen_duong?: TuyenDuong[];
  [key: string]: any;
}

export interface Area {
  area_id: string;
  area_name: string;
  domain: string;
  main_hotspot_id?: string | null;
  created_at?: string;
  chatbot_limit_request?: number;
  is_active?: boolean;
  description?: string;
  metadata?: AreaMetadata | null;
}
