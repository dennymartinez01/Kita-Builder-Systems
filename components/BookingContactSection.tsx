'use client'

import { useState } from 'react'
import { Calendar, MessageSquare } from 'lucide-react'
import BookingForm from '@/components/BookingForm'
import ContactForm from '@/components/ContactForm'
import type { Service, Staff } from '@/types/database'

interface Props {
  siteId: string
  services: Service[]
  staff: Staff[]
  requiresField: 'car_model' | 'pet_name' | 'none'
  primaryColor: string
  depositPercent: number
  title?: string
  notesLabel?: string
  notesPlaceholder?: string
  notesRequired?: boolean
  currencySymbol?: string
  siteTimezone?: string
  enableCoupons?: boolean
  enableCustomerAccounts?: boolean
  showContactTab?: boolean   // controlled by entitlement / plan
}

export default function BookingContactSection({
  siteId,
  services,
  staff,
  requiresField,
  primaryColor,
  depositPercent,
  title,
  notesLabel,
  notesPlaceholder,
  notesRequired,
  currencySymbol,
  siteTimezone,
  enableCoupons,
  enableCustomerAccounts,
  showContactTab = true,
}: Props) {
  const [activeTab, setActiveTab] = useState<'book' | 'enquire'>('book')

  // If contact tab disabled just show booking form directly (no tabs)
  if (!showContactTab) {
    return (
      <BookingForm
        siteId={siteId}
        services={services}
        staff={staff}
        requiresField={requiresField}
        primaryColor={primaryColor}
        depositPercent={depositPercent}
        title={title}
        notesLabel={notesLabel}
        notesPlaceholder={notesPlaceholder}
        notesRequired={notesRequired}
        currencySymbol={currencySymbol}
        siteTimezone={siteTimezone}
        enableCoupons={enableCoupons}
        enableCustomerAccounts={enableCustomerAccounts}
      />
    )
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
            activeTab === 'book'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={15} style={activeTab === 'book' ? { color: primaryColor } : {}} />
          Book
        </button>
        <button
          onClick={() => setActiveTab('enquire')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
            activeTab === 'enquire'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={15} style={activeTab === 'enquire' ? { color: primaryColor } : {}} />
          Enquire
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'book' ? (
        <BookingForm
          siteId={siteId}
          services={services}
          staff={staff}
          requiresField={requiresField}
          primaryColor={primaryColor}
          depositPercent={depositPercent}
          title={title}
          notesLabel={notesLabel}
          notesPlaceholder={notesPlaceholder}
          notesRequired={notesRequired}
          currencySymbol={currencySymbol}
          siteTimezone={siteTimezone}
          enableCoupons={enableCoupons}
          enableCustomerAccounts={enableCustomerAccounts}
        />
      ) : (
        <ContactForm
          siteId={siteId}
          primaryColor={primaryColor}
          services={services.map(s => ({ id: s.id, name: s.name }))}
        />
      )}
    </div>
  )
}
