import type { ThemeJson } from '@/types/database'

export const cafeTemplate: ThemeJson = {
  business_type: 'cafe',
  business_name: '{{BUSINESS_NAME}}',
  theme: {
    primary: '#92400E',
    secondary: '#F59E0B',
    font: 'Inter',
    bg: '#FFFBEB',
  },
  sections: [
    {
      type: 'hero',
      data: {
        headline: 'Great Coffee. Good Vibes.',
        sub: "Reserve your table online — no waiting, no hassle. We'll have it ready for you.",
        cta: 'Reserve a Table',
        image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop',
      },
    },
    {
      type: 'about',
      data: {
        title: 'About {{BUSINESS_NAME}}',
        body: 'We brew with passion and serve with heart. From specialty coffee to freshly made food, every visit is an experience worth savouring.',
      },
    },
    {
      type: 'services',
      data: { source: 'services_table' },
    },
    {
      type: 'staff',
      data: { source: 'staff_table' },
    },
    {
      type: 'booking_widget',
      data: {
        requires_field: 'none',
        deposit_percent: 0,
        title: 'Reserve Your Table',
      },
    },
    {
      type: 'testimonials',
      data: {
        items: [
          { name: 'Jake W.', text: 'Best flat white in the city. The food is incredible too.', rating: 5 },
          { name: 'Michelle P.', text: 'Love the vibe here. Always come back with friends.', rating: 5 },
          { name: 'Raul G.', text: 'Reserved online and the table was ready exactly on time.', rating: 5 },
        ],
      },
    },
  ],
}

export const cafeDefaultServices = [
  { name: 'Table for 2', price: 0, duration_minutes: 60 },
  { name: 'Table for 4', price: 0, duration_minutes: 90 },
  { name: 'Table for 6', price: 0, duration_minutes: 90 },
  { name: 'Private Booth (up to 8)', price: 50, duration_minutes: 120 },
  { name: 'Events / Full Venue', price: 200, duration_minutes: 240 },
]

export const cafeDefaultStaff = [
  { name: 'Carlos Diaz', role: 'Head Barista' },
  { name: 'Mia Santos', role: 'Chef' },
  { name: 'Ben Flores', role: 'Floor Manager' },
]
