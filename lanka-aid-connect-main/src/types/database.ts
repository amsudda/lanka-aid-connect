export type NeedCategory = 'food' | 'dry_rations' | 'baby_items' | 'medical' | 'clothes' | 'other';
export type PostStatus = 'active' | 'fulfilled' | 'flagged' | 'hidden';

export interface NeedPost {
  id: string;
  victim_name: string;
  phone_number: string;
  whatsapp_link: string | null;
  location_district: string;
  location_city: string | null;
  location_landmark: string | null;
  location_description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  category: NeedCategory;
  title: string;
  description: string;
  quantity_needed: number;
  quantity_donated: number;
  status: PostStatus;
  edit_pin: string;
  flag_count: number;
  voice_note_url: string | null;
  is_verified: boolean;
  num_adults: number;
  num_children: number;
  num_infants: number;
  infant_ages: number[] | null;
  is_group_request: boolean;
  group_size: number | null;
  created_at: string;
  updated_at: string;
  images?: PostImage[];
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface DonationImage {
  id: string;
  donation_id: string;
  image_url: string;
  display_order: number;
}

export interface Donation {
  id: string;
  post_id: string;
  donor_id: string | null;
  donor_name: string;
  donor_phone?: string | null;
  quantity: number;
  item_description?: string | null;
  message: string | null;
  status: 'pledged' | 'in_transit' | 'delivered' | 'fulfilled';
  fulfilled_at?: string | null;
  created_at: string;
  images?: DonationImage[];
  donor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface DonorProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  families_helped: number;
  items_donated: number;
  districts_active: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface EmergencyCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string | null;
  location_lat: number | null;
  location_lng: number | null;
  needs_list: string[] | null;
  is_verified: boolean;
  created_at: string;
}

export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
] as const;

export const CATEGORY_LABELS: Record<NeedCategory, string> = {
  food: 'Food',
  dry_rations: 'Dry Rations',
  baby_items: 'Baby Items',
  medical: 'Medical',
  clothes: 'Clothes',
  other: 'Other'
};

export const CATEGORY_ICONS: Record<NeedCategory, string> = {
  food: '🍚',
  dry_rations: '📦',
  baby_items: '🍼',
  medical: '💊',
  clothes: '👕',
  other: '📋'
};
