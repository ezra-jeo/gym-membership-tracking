import type { Json } from './database.types';

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  photo_url?: string;
};

export type PricingPackage = {
  name: string;
  price: string;
  duration: string;
  features: string[];
  is_featured?: boolean;
};

export type GymPageData = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  brand_color: string;
  operating_hours: Record<string, string> | null;
  amenities: string[] | null;
  social_links: { facebook?: string; instagram?: string; website?: string } | null;
  team_members: TeamMember[] | null;
  pricing_packages: PricingPackage[] | null;
  map_embed_url: string | null;
  directions: string | null;
  member_count: number;
  is_published: boolean;
};

type JsonObject = { [key: string]: Json | undefined };

function isJsonObject(value: Json): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toTeamMembers(value: Json | null): TeamMember[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .filter((v): v is JsonObject => isJsonObject(v))
    .map((v) => ({
      name: typeof v.name === 'string' ? v.name : '',
      role: typeof v.role === 'string' ? v.role : '',
      bio: typeof v.bio === 'string' ? v.bio : undefined,
      photo_url: typeof v.photo_url === 'string' ? v.photo_url : undefined,
    }))
    .filter((m) => m.name);
}

export function toPricingPackages(value: Json | null): PricingPackage[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .filter((v): v is JsonObject => isJsonObject(v))
    .map((v) => ({
      name: typeof v.name === 'string' ? v.name : '',
      price: typeof v.price === 'string' ? v.price : '',
      duration: typeof v.duration === 'string' ? v.duration : '',
      features: Array.isArray(v.features)
        ? v.features.filter((f): f is string => typeof f === 'string')
        : [],
      is_featured: typeof v.is_featured === 'boolean' ? v.is_featured : false,
    }))
    .filter((p) => p.name);
}
