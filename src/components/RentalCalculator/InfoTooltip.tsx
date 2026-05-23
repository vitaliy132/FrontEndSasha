import { useState } from 'react'

interface InfoTooltipProps {
  priceLabel: string
  items: string[]
}

export function InfoTooltip({ priceLabel, items }: InfoTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <>
      {' '}
      <span
        className="info-icon"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ℹ️
      </span>
      {show && (
        <div className="absolute z-10 mt-1 w-64 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 shadow-lg">
          <p className="sr-only">{priceLabel}</p>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

const KITCHEN_KIT_ITEMS = [
  'Toaster',
  'Pots with lids',
  'Frying pan',
  'Kettle',
  'Coffee / tea pot',
  'Carving knife',
  'Tongs',
  'Oven mitts',
  'Salt & pepper shakers',
  'Mixing bowls',
  'Measuring cups',
  'Wooden spoons',
  'Tea towels',
  'Dish cloths',
]

const PERSONAL_KIT_ITEMS = [
  'Blanket',
  'Bottom sheet',
  'Top sheet',
  'Pillow + pillowcase',
  'Face cloth',
  'Hand towel',
  'Bath towel',
  'Hanger',
]

export function KitchenKitTooltip() {
  return (
    <InfoTooltip
      priceLabel="Kitchen Kit ($85/trip)"
      items={KITCHEN_KIT_ITEMS}
    />
  )
}

export function PersonalKitTooltip() {
  return (
    <InfoTooltip
      priceLabel="Personal Kit ($35/person)"
      items={PERSONAL_KIT_ITEMS}
    />
  )
}
