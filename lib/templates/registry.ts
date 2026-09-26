import type { BusinessType, ThemeJson } from '@/types/database'

export interface TemplateVariant {
  id: string
  name: string
  business_type: BusinessType
  version: number        // 1 = Base Template 1, 2 = Base Template 2, etc.
  label: string          // e.g. "Base Template 1"
  description: string
  tags: string[]
  colors: {
    primary: string
    secondary: string
    bg: string
  }
  font: string
  previewBg: string      // gradient string for card thumbnail
  isFree: boolean
  isNew: boolean
  template: ThemeJson
}

// ─── SALON VARIANTS ───────────────────────────────────────────────
const salonBase: ThemeJson = {
  business_type: 'salon',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#1A1A2E', secondary: '#E94560', font: 'Inter', bg: '#FAFAFA' },
  sections: [
    { type: 'hero', data: { headline: 'Look Good. Feel Amazing.', sub: 'Book your appointment online — no calls needed. Same-day slots available.', cta: 'Book Now', image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'We are a professional salon dedicated to making you look and feel your best.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 0, title: 'Book Your Appointment', notes_label: 'Preferred Style / Service Type', notes_placeholder: 'e.g. Balayage, keratin treatment, specific style reference...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Sarah M.', text: "Best salon I've been to! My hair has never looked this good.", rating: 5 }, { name: 'James T.', text: 'Quick, clean, and professional. Will definitely be back.', rating: 5 }, { name: 'Chloe R.', text: 'The team is so talented. They listened to exactly what I wanted.', rating: 5 }] } },
  ],
}

const salonGold: ThemeJson = {
  business_type: 'salon',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#2D1B69', secondary: '#F5A623', font: 'Inter', bg: '#FFF9F0' },
  sections: [
    { type: 'hero', data: { headline: 'Where Beauty Meets Luxury.', sub: 'Premium hair and beauty services. Walk in or book online today.', cta: 'Reserve Now', image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'A luxury salon experience for those who expect the best.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 20, title: 'Reserve Your Session', notes_label: 'Preferred Style / Service Type', notes_placeholder: 'e.g. Highlights, updo, specific colour reference...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Emma W.', text: 'Absolute luxury. Worth every penny.', rating: 5 }, { name: 'Olivia R.', text: 'Best colour work in the city. I get compliments everywhere.', rating: 5 }, { name: 'Sophia L.', text: 'The most relaxing salon experience I have ever had.', rating: 5 }] } },
  ],
}

const salonMinimal: ThemeJson = {
  business_type: 'salon',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#111111', secondary: '#FFFFFF', font: 'Inter', bg: '#FFFFFF' },
  sections: [
    { type: 'hero', data: { headline: 'Clean Cuts. Every Time.', sub: 'Simple booking. Expert stylists. No fuss.', cta: 'Book Now', image_url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'Minimalist barbershop focused on precision cuts and great service.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 0, title: 'Book a Cut', notes_label: 'Preferred Barber / Style Notes', notes_placeholder: 'e.g. Ask for Marcus, skin fade with 1 on sides, leave top long...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Mike D.', text: 'No nonsense, great cut every time.', rating: 5 }, { name: 'Tom B.', text: 'Best fade in the area. Always on time.', rating: 5 }, { name: 'Jay P.', text: 'Clean shop, clean cuts. My go-to spot.', rating: 5 }] } },
  ],
}

// ─── CLINIC VARIANTS ──────────────────────────────────────────────
const clinicBase: ThemeJson = {
  business_type: 'clinic',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#0369A1', secondary: '#0EA5E9', font: 'Inter', bg: '#F0F9FF' },
  sections: [
    { type: 'hero', data: { headline: 'Trusted Care When You Need It Most.', sub: 'Book a consultation online — fast, easy, and available 24/7.', cta: 'Book Appointment', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'We provide compassionate, high-quality healthcare for patients of all ages.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 0, title: 'Book a Consultation', notes_label: 'Your Concern', notes_placeholder: 'e.g. Tooth pain, general checkup, skin condition, vaccination...', notes_required: true } },
    { type: 'testimonials', data: { items: [{ name: 'Maria L.', text: 'The doctor was thorough and took time to explain everything.', rating: 5 }, { name: 'David K.', text: 'Booked online and was seen within the hour. Very professional.', rating: 5 }, { name: 'Priya S.', text: 'Clean, efficient, and caring staff. Highly recommend.', rating: 5 }] } },
  ],
}

const clinicGreen: ThemeJson = {
  business_type: 'clinic',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#065F46', secondary: '#10B981', font: 'Inter', bg: '#F0FDF4' },
  sections: [
    { type: 'hero', data: { headline: 'Your Health, Our Priority.', sub: 'Modern healthcare with a personal touch. Book your visit today.', cta: 'Schedule Visit', image_url: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'A modern health clinic committed to preventive care and wellness.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 0, title: 'Schedule Your Visit', notes_label: 'Your Concern', notes_placeholder: 'e.g. Annual checkup, follow-up appointment, referral...', notes_required: true } },
    { type: 'testimonials', data: { items: [{ name: 'James F.', text: 'Finally a clinic that actually listens to patients.', rating: 5 }, { name: 'Helen C.', text: 'Modern facility, friendly staff, quick service.', rating: 5 }, { name: 'Robert M.', text: 'I have been coming here for years. Always excellent.', rating: 5 }] } },
  ],
}

// ─── PET VARIANTS ─────────────────────────────────────────────────
const petBase: ThemeJson = {
  business_type: 'pet',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#15803D', secondary: '#4ADE80', font: 'Inter', bg: '#F0FDF4' },
  sections: [
    { type: 'hero', data: { headline: 'Your Pet Deserves the Best Care.', sub: 'Experienced vets and groomers who treat your fur baby like family.', cta: 'Book a Visit', image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'We are passionate about animal health and happiness.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'pet_name', deposit_percent: 0, title: 'Book for Your Pet', notes_label: 'Reason for Visit', notes_placeholder: 'e.g. Annual vaccination, skin condition, grooming style preference...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Tom & Biscuit 🐶', text: 'My dog loves coming here! The vet is so patient and kind.', rating: 5 }, { name: 'Anna & Whiskers 🐱', text: 'Grooming was perfect. My cat was calm after.', rating: 5 }, { name: 'Leo H.', text: 'Vaccination done in 20 minutes. Very efficient team.', rating: 5 }] } },
  ],
}

const petPlayful: ThemeJson = {
  business_type: 'pet',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#7C3AED', secondary: '#F472B6', font: 'Inter', bg: '#FDF4FF' },
  sections: [
    { type: 'hero', data: { headline: 'Happy Pets. Happy Life.', sub: 'Gentle grooming and expert vet care. Because they are family.', cta: 'Book Now 🐾', image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'A fun, stress-free environment where pets actually enjoy their visits.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'pet_name', deposit_percent: 0, title: 'Book Your Furry Friend', notes_label: 'Reason for Visit', notes_placeholder: 'e.g. First visit, grooming preferences, any health concerns...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Sophie & Mochi 🐰', text: 'My bunny actually seemed happy after the visit!', rating: 5 }, { name: 'Carlos & Rex 🐶', text: 'Friendly staff and great with nervous dogs.', rating: 5 }, { name: 'Mia & Luna 🐱', text: 'Best grooming in town. Luna looks gorgeous!', rating: 5 }] } },
  ],
}

// ─── CAFE VARIANTS ────────────────────────────────────────────────
const cafeBase: ThemeJson = {
  business_type: 'cafe',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#92400E', secondary: '#F59E0B', font: 'Inter', bg: '#FFFBEB' },
  sections: [
    { type: 'hero', data: { headline: 'Great Coffee. Good Vibes.', sub: 'Reserve your table online — no waiting, no hassle.', cta: 'Reserve a Table', image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'We brew with passion and serve with heart.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 0, title: 'Reserve Your Table', notes_label: 'Number of Guests & Special Requests', notes_placeholder: 'e.g. 4 guests, birthday celebration, dietary requirements...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Jake W.', text: 'Best flat white in the city. The food is incredible too.', rating: 5 }, { name: 'Michelle P.', text: 'Love the vibe here. Always come back with friends.', rating: 5 }, { name: 'Raul G.', text: 'Reserved online and the table was ready exactly on time.', rating: 5 }] } },
  ],
}

const cafeDark: ThemeJson = {
  business_type: 'cafe',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#1C1917', secondary: '#D97706', font: 'Inter', bg: '#F5F0E8' },
  sections: [
    { type: 'hero', data: { headline: 'Brewed to Perfection.', sub: 'Specialty coffee and artisan food. Reserve your seat now.', cta: 'Book a Table', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'A dark roast specialist cafe with a passion for the perfect cup.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'none', deposit_percent: 0, title: 'Book a Table', notes_label: 'Number of Guests & Special Requests', notes_placeholder: 'e.g. 2 guests, quiet corner table, coffee tasting...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Aaron T.', text: 'The espresso here is genuinely world class.', rating: 5 }, { name: 'Fiona B.', text: 'Dark, cozy, and perfect for a working lunch.', rating: 5 }, { name: 'Liam S.', text: 'I come here every morning. Never disappoints.', rating: 5 }] } },
  ],
}

// ─── MECHANIC VARIANTS ────────────────────────────────────────────
const mechanicBase: ThemeJson = {
  business_type: 'mechanic',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#1C1C1C', secondary: '#EF4444', font: 'Inter', bg: '#F8F8F8' },
  sections: [
    { type: 'hero', data: { headline: 'Fast. Honest. Reliable Auto Care.', sub: 'Book your service online — tell us your car, pick a time.', cta: 'Book a Service', image_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'A trusted local mechanic shop with years of experience servicing all makes and models.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'car_model', deposit_percent: 0, title: 'Book Your Car Service', notes_label: 'Additional Notes', notes_placeholder: 'e.g. Strange noise from brakes, car has not been serviced in 2 years...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Craig B.', text: 'Fixed my brakes same day. Fair pricing and transparent.', rating: 5 }, { name: 'Natasha V.', text: "I finally found a mechanic I can trust. Won't go anywhere else.", rating: 5 }, { name: 'Steve L.', text: 'Booked online, dropped car off, picked up 3 hours later.', rating: 5 }] } },
  ],
}

const mechanicBlue: ThemeJson = {
  business_type: 'mechanic',
  business_name: '{{BUSINESS_NAME}}',
  theme: { primary: '#1E3A5F', secondary: '#3B82F6', font: 'Inter', bg: '#F0F4FF' },
  sections: [
    { type: 'hero', data: { headline: 'Professional Auto Care You Can Trust.', sub: 'Expert mechanics. Fair prices. Book your service in 60 seconds.', cta: 'Book Now', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&auto=format&fit=crop' } },
    { type: 'about', data: { title: 'About {{BUSINESS_NAME}}', body: 'A professional auto repair centre with certified mechanics and transparent pricing.' } },
    { type: 'services', data: { source: 'services_table' } },
    { type: 'staff', data: { source: 'staff_table' } },
    { type: 'booking_widget', data: { requires_field: 'car_model', deposit_percent: 0, title: 'Schedule Your Service', notes_label: 'Additional Notes', notes_placeholder: 'e.g. Fleet vehicle, warranty work, specific issue to inspect...', notes_required: false } },
    { type: 'testimonials', data: { items: [{ name: 'Daniel F.', text: 'Professional, transparent, and fast. Highly recommended.', rating: 5 }, { name: 'Karen M.', text: 'They diagnosed the issue in minutes and had it fixed by lunch.', rating: 5 }, { name: 'Paul T.', text: 'Best auto shop in the area. Will not go anywhere else.', rating: 5 }] } },
  ],
}

// ─── TEMPLATE REGISTRY ────────────────────────────────────────────
export const TEMPLATE_REGISTRY: TemplateVariant[] = [
  // SALON
  { id: 'salon-base', name: 'Classic Salon', business_type: 'salon', version: 1, label: 'Base Template 1', description: 'Clean dark theme with red accent. Perfect for salons, barbershops, and spas.', tags: ['Dark', 'Classic', 'Booking'], colors: { primary: '#1A1A2E', secondary: '#E94560', bg: '#FAFAFA' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #1A1A2E 0%, #E94560 100%)', isFree: true, isNew: false, template: salonBase },
  { id: 'salon-gold', name: 'Luxury Salon', business_type: 'salon', version: 2, label: 'Base Template 2', description: 'Deep purple with gold accents. For premium salons targeting upmarket clients.', tags: ['Luxury', 'Gold', 'Premium'], colors: { primary: '#2D1B69', secondary: '#F5A623', bg: '#FFF9F0' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #2D1B69 0%, #F5A623 100%)', isFree: true, isNew: true, template: salonGold },
  { id: 'salon-minimal', name: 'Minimal Barber', business_type: 'salon', version: 3, label: 'Base Template 3', description: 'Pure black and white. For modern barbershops with a minimal aesthetic.', tags: ['Minimal', 'Barber', 'Modern'], colors: { primary: '#111111', secondary: '#FFFFFF', bg: '#FFFFFF' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #111111 0%, #555555 100%)', isFree: true, isNew: false, template: salonMinimal },
  // CLINIC
  { id: 'clinic-base', name: 'Medical Blue', business_type: 'clinic', version: 1, label: 'Base Template 1', description: 'Professional blue theme. Trusted look for clinics, dental, and medical practices.', tags: ['Medical', 'Blue', 'Professional'], colors: { primary: '#0369A1', secondary: '#0EA5E9', bg: '#F0F9FF' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)', isFree: true, isNew: false, template: clinicBase },
  { id: 'clinic-green', name: 'Wellness Green', business_type: 'clinic', version: 2, label: 'Base Template 2', description: 'Calming green theme. Great for wellness clinics, physio, and holistic health.', tags: ['Wellness', 'Green', 'Calm'], colors: { primary: '#065F46', secondary: '#10B981', bg: '#F0FDF4' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)', isFree: true, isNew: true, template: clinicGreen },
  // PET
  { id: 'pet-base', name: 'Nature Pet Clinic', business_type: 'pet', version: 1, label: 'Base Template 1', description: 'Fresh green theme for vet clinics and pet grooming services.', tags: ['Vet', 'Green', 'Nature'], colors: { primary: '#15803D', secondary: '#4ADE80', bg: '#F0FDF4' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #15803D 0%, #4ADE80 100%)', isFree: true, isNew: false, template: petBase },
  { id: 'pet-playful', name: 'Playful Pet Studio', business_type: 'pet', version: 2, label: 'Base Template 2', description: 'Fun purple and pink theme for pet grooming studios targeting younger pet owners.', tags: ['Playful', 'Grooming', 'Fun'], colors: { primary: '#7C3AED', secondary: '#F472B6', bg: '#FDF4FF' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #7C3AED 0%, #F472B6 100%)', isFree: true, isNew: true, template: petPlayful },
  // CAFE
  { id: 'cafe-base', name: 'Warm Cafe', business_type: 'cafe', version: 1, label: 'Base Template 1', description: 'Warm amber tones for cafes and restaurants with table reservations.', tags: ['Warm', 'Coffee', 'Reservation'], colors: { primary: '#92400E', secondary: '#F59E0B', bg: '#FFFBEB' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #92400E 0%, #F59E0B 100%)', isFree: true, isNew: false, template: cafeBase },
  { id: 'cafe-dark', name: 'Dark Roast Cafe', business_type: 'cafe', version: 2, label: 'Base Template 2', description: 'Dark moody theme for specialty coffee shops and artisan cafes.', tags: ['Dark', 'Specialty', 'Artisan'], colors: { primary: '#1C1917', secondary: '#D97706', bg: '#F5F0E8' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #1C1917 0%, #D97706 100%)', isFree: true, isNew: false, template: cafeDark },
  // MECHANIC
  { id: 'mechanic-base', name: 'Bold Mechanic', business_type: 'mechanic', version: 1, label: 'Base Template 1', description: 'Dark charcoal with red. The go-to for auto repair shops and service centres.', tags: ['Bold', 'Auto', 'Service'], colors: { primary: '#1C1C1C', secondary: '#EF4444', bg: '#F8F8F8' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #1C1C1C 0%, #EF4444 100%)', isFree: true, isNew: false, template: mechanicBase },
  { id: 'mechanic-blue', name: 'Pro Auto Centre', business_type: 'mechanic', version: 2, label: 'Base Template 2', description: 'Navy and blue for professional auto centres targeting corporate fleet clients.', tags: ['Professional', 'Fleet', 'Corporate'], colors: { primary: '#1E3A5F', secondary: '#3B82F6', bg: '#F0F4FF' }, font: 'Inter', previewBg: 'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)', isFree: true, isNew: true, template: mechanicBlue },
]

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'salon', label: '✂️ Salon / Barber' },
  { id: 'clinic', label: '🏥 Clinic' },
  { id: 'pet', label: '🐾 Pet' },
  { id: 'cafe', label: '☕ Cafe' },
  { id: 'mechanic', label: '🔧 Mechanic' },
]

export function getTemplateById(id: string): TemplateVariant | undefined {
  return TEMPLATE_REGISTRY.find(t => t.id === id)
}

export function getTemplatesByType(type: BusinessType): TemplateVariant[] {
  return TEMPLATE_REGISTRY.filter(t => t.business_type === type)
}
