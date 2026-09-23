import { salonTemplate } from './salon'
import { clinicTemplate } from './clinic'
import { petTemplate } from './pet'
import { cafeTemplate } from './cafe'
import { mechanicTemplate } from './mechanic'
import type { BusinessType } from '@/types/database'

export const TEMPLATES = {
  salon: salonTemplate,
  clinic: clinicTemplate,
  pet: petTemplate,
  cafe: cafeTemplate,
  mechanic: mechanicTemplate,
} as const

export type TemplateKey = BusinessType

export function getTemplate(type: BusinessType) {
  return TEMPLATES[type]
}

export { salonTemplate, clinicTemplate, petTemplate, cafeTemplate, mechanicTemplate }

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  salon: 'Salon / Barbershop / Spa',
  clinic: 'Human Clinic / Dental',
  pet: 'Pet Clinic / Grooming',
  cafe: 'Cafe / Restaurant',
  mechanic: 'Mechanic / Auto Repair',
}

export const BUSINESS_TYPE_ICONS: Record<BusinessType, string> = {
  salon: '✂️',
  clinic: '🏥',
  pet: '🐾',
  cafe: '☕',
  mechanic: '🔧',
}
