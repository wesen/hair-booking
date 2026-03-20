// Main widgets
export { StylistApp } from "./StylistApp";
export { ClientBookingApp } from "./ClientBookingApp";

// Components
export { Icon } from "./components/Icon";
export { Button } from "./components/Button";
export { Card } from "./components/Card";
export { Input } from "./components/Input";
export { StatusBadge } from "./components/StatusBadge";
export { TierBadge } from "./components/TierBadge";
export { Toast } from "./components/Toast";
export { ProgressBar } from "./components/ProgressBar";
export { StatBox } from "./components/StatBox";
export { AppointmentRow } from "./components/AppointmentRow";
export { ServiceOption } from "./components/ServiceOption";
export { TimeSlot } from "./components/TimeSlot";
export { DateCell } from "./components/DateCell";
export { ClientCard } from "./components/ClientCard";
export { RewardItem } from "./components/RewardItem";
export { QuickAction } from "./components/QuickAction";
export { BookingDot } from "./components/BookingDot";
export { TopBar } from "./components/TopBar";
export { TabBar } from "./components/TabBar";
export { Modal } from "./components/Modal";
export { SectionTitle } from "./components/SectionTitle";
export { ReferralModal } from "./components/ReferralModal";
export { BookingProgress } from "./components/BookingProgress";
export { ClientDetail } from "./components/ClientDetail";

// Consultation components
export { RadioOption } from "./components/RadioOption";
export { CheckPill } from "./components/CheckPill";
export { PhotoBox } from "./components/PhotoBox";
export { FormGroup } from "./components/FormGroup";
export { ExtTypeCard } from "./components/ExtTypeCard";
export { LengthSlider } from "./components/LengthSlider";
export { EstimateCard } from "./components/EstimateCard";
export { CalendarGrid } from "./components/CalendarGrid";
export { ConfirmCard } from "./components/ConfirmCard";
export { ServiceCard } from "./components/ServiceCard";
export { ConsultNavBar } from "./components/ConsultNavBar";
export { Hint } from "./components/Hint";

// Pages
export { HomePage } from "./pages/HomePage";
export { SchedulePage } from "./pages/SchedulePage";
export { ClientsPage } from "./pages/ClientsPage";
export { LoyaltyPage } from "./pages/LoyaltyPage";
export { BookingPage } from "./pages/BookingPage";

// Consultation pages
export { ConsultWelcomePage } from "./pages/ConsultWelcomePage";
export { IntakeExtPage } from "./pages/IntakeExtPage";
export { IntakeColorPage } from "./pages/IntakeColorPage";
export { PhotosPage } from "./pages/PhotosPage";
export { GoalsExtPage } from "./pages/GoalsExtPage";
export { GoalsColorPage } from "./pages/GoalsColorPage";
export { ConsultEstimatePage } from "./pages/ConsultEstimatePage";
export { ConsultCalendarPage } from "./pages/ConsultCalendarPage";
export { ConsultConfirmPage } from "./pages/ConsultConfirmPage";

// Store
export { store, useAppDispatch, useAppSelector } from "./store";
export { createAppStore, stylistApi } from "./store";
export type { RootState, AppDispatch, AppStore } from "./store";
export * from "./store/api";

// Types
export type { Service, Client, Appointment, LoyaltyTier, BookingData, Tab, IconName } from "./types";
export type { ConsultationServiceType, ExtensionType, ColorServiceOption, ConsultationScreen, ConsultationData, PriceEstimate } from "./types";

// Utils
export { getTier, getTierProgress } from "./utils/loyalty";
export { getAvatarColor, getInitials } from "./utils/avatar";
export { estimatePrice } from "./utils/estimate";

// Data
export { SERVICES, TIME_SLOTS, INITIAL_CLIENTS, INITIAL_APPOINTMENTS, LOYALTY_TIERS, REWARDS } from "./data/constants";
export { HAIR_LENGTHS, HAIR_DENSITY, HAIR_TEXTURE, EXT_TYPES, COLOR_SERVICES, BUDGET_RANGES, MAINT_OPTIONS, CHEMICAL_HISTORY, CALENDAR_DATA } from "./data/consultation-constants";

// Parts
export { PARTS, part } from "./parts";
