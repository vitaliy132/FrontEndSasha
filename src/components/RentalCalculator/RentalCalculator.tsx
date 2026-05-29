import { CalculatorHeader } from './CalculatorHeader'
import { ContactSection } from './ContactSection'
import { SeasonalRatesSection } from './SeasonalRatesSection'
import { EstimatePanel } from './EstimatePanel'
import { TripDetailsForm } from './TripDetailsForm'
import { useLeadForm } from './useLeadForm'
import { useLeadSubmission } from './useLeadSubmission'
import { useRentalCalculation } from './useRentalCalculation'
import { useRentalForm } from './useRentalForm'

export function RentalCalculator() {
  const {
    formData,
    vehicleTypes,
    modelOptions,
    selectedModelLabel,
    minimumRentalDays,
    rentalOptionsLoading,
    rentalOptionsError,
    updateField,
    updateVehicleType,
    userId,
  } = useRentalForm()

  const { formData: leadFormData, updateField: updateLeadField } = useLeadForm()

  const {
    calculating,
    calcError,
    result,
    tooShortRental,
    cannotCalculate,
    handleCalculate,
  } = useRentalCalculation({
    formData,
    minimumRentalDays,
    rentalOptionsLoading,
    rentalOptionsError,
  })

  const {
    showBooking,
    leadLoading,
    leadError,
    leadSuccess,
    openBookingForm,
    handleLeadSubmit,
  } = useLeadSubmission({
    formData,
    leadFormData,
    selectedModelLabel,
    result,
    userId,
  })

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <CalculatorHeader />

        <SeasonalRatesSection />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <TripDetailsForm
            formData={formData}
            vehicleTypes={vehicleTypes}
            modelOptions={modelOptions}
            minimumRentalDays={minimumRentalDays}
            rentalOptionsLoading={rentalOptionsLoading}
            rentalOptionsError={rentalOptionsError}
            calculating={calculating}
            calcError={calcError}
            tooShortRental={tooShortRental}
            cannotCalculate={cannotCalculate}
            onSubmit={handleCalculate}
            onUpdateField={updateField}
            onUpdateVehicleType={updateVehicleType}
          />

          <EstimatePanel
            calculating={calculating}
            result={result}
            showBooking={showBooking}
            leadFormData={leadFormData}
            leadLoading={leadLoading}
            leadError={leadError}
            leadSuccess={leadSuccess}
            userId={userId}
            onOpenBooking={openBookingForm}
            onLeadFieldChange={updateLeadField}
            onLeadSubmit={handleLeadSubmit}
          />

          <ContactSection />
        </div>
      </div>
    </div>
  )
}
