export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type WeekHours = Record<
  Weekday,
  { open: string; close: string } | null
>;

export type PostCategory = "NEWS" | "ANNOUNCEMENT" | "NOTICE";
export type PostStatus = "DRAFT" | "PUBLISHED";
export type EventStatus = "DRAFT" | "PUBLISHED";
export type DocumentCategory =
  | "ADMISSION_FORM"
  | "FEE_SCHEDULE"
  | "POLICY"
  | "OTHER";
export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "VISIT_ARRANGED"
  | "ENROLLED"
  | "NOT_PROCEEDING";
export type EnquirySource = "WEBSITE" | "WHATSAPP" | "PHONE" | "WALK_IN";
export type Role = "admin" | "editor";

export interface Media {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeSummary {
  id: string;
  slug: string;
  name: string;
  ageLabel: string;
  summary: string;
  monthlyFeeCents: number | null;
  feeNote?: string | null;
  ageFromMonths?: number;
  ageToMonths?: number;
  isPublished?: boolean;
  sortOrder?: number;
  image?: Media | null;
  branches?: Array<{ id: string; slug: string; name: string }>;
  branchIds?: string[];
}

export interface DailyRhythmItem {
  time: string;
  label: string;
}

export interface Programme extends ProgrammeSummary {
  description: string;
  dailyRhythm: DailyRhythmItem[];
  hoursLabel: string;
  imageId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  addressLine1: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  whatsapp: string;
  email: string;
  hours: WeekHours;
  description: string;
  heroImageId: string | null;
  heroImage: Media | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  programmes: ProgrammeSummary[];
  createdAt: string;
  updatedAt: string;
  _count?: { enquiries: number; programmeBranches: number };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyMd?: string;
  coverId: string | null;
  cover: Media | null;
  category: PostCategory;
  branchId: string | null;
  branch: { id: string; slug: string; name: string } | null;
  isPinned: boolean;
  status: PostStatus;
  publishedAt: string | null;
  authorId: string;
  author: { id: string; name: string };
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  descriptionMd: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  locationText: string;
  branchId: string | null;
  branch: { id: string; slug: string; name: string } | null;
  coverId: string | null;
  cover: Media | null;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumPhoto {
  id: string;
  albumId: string;
  mediaId: string;
  caption: string;
  alt: string;
  sortOrder: number;
  media: Media;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverId: string | null;
  cover: Media | null;
  branchId: string | null;
  branch: { id: string; slug: string; name: string } | null;
  takenOn: string | null;
  isPublished: boolean;
  photos?: AlbumPhoto[];
  _count?: { photos: number };
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  mediaId: string;
  media: Media;
  branchId: string | null;
  branch: { id: string; slug: string; name: string } | null;
  sortOrder: number;
  isPublished: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryNote {
  id: string;
  enquiryId: string;
  authorId: string;
  body: string;
  author: { id: string; name: string };
  createdAt: string;
}

export interface Enquiry {
  id: string;
  reference: string;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childDateOfBirth: string | null;
  branchId: string;
  branch: Branch | { id: string; slug: string; name: string };
  programmeId: string | null;
  programme: { id: string; slug: string; name: string } | null;
  preferredStart: string | null;
  message: string;
  source: EnquirySource;
  consentPopia: boolean;
  consentAt: string;
  status: EnquiryStatus;
  notes?: EnquiryNote[];
  _count?: { notes: number };
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  schoolName: string;
  tagline: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  ogImageId: string | null;
  ogImage: Media | null;
  whatsappDefaultMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeData {
  settings: SiteSettings | null;
  branches: Branch[];
  programmes: ProgrammeSummary[];
  posts: Post[];
  events: Event[];
  photos: Array<AlbumPhoto & { album: { title: string; slug: string } }>;
  albums: Album[];
}

export interface BranchDetail extends Branch {
  posts: Post[];
  events: Event[];
  albums: Album[];
}

export interface EnquiryResponse {
  reference: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardData {
  stats: {
    newEnquiries: number;
    upcomingEvents: number;
    draftPosts: number;
    publishedPosts: number;
    albumCount: number;
    documentCount: number;
  };
  recentEnquiries: Enquiry[];
  recentEmails: Array<{
    id: string;
    to: string;
    subject: string;
    createdAt: string;
  }>;
}

export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template: string;
  relatedType: string | null;
  relatedId: string | null;
  createdAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
