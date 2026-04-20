import {
  FeatureFrame,
  ImagePicker,
  MoneyField,
  PrimaryButton,
  ProgressMeter,
  SectionGrid,
  SecondaryButton,
  SelectField,
  SurfaceCard,
  TextField,
  ToggleField,
} from "../InventorsInvestorsUI";
import {
  INVESTOR_STAGE_OPTIONS,
  calculateCompleteness,
  validateInvestorProfile,
} from "../../../utils/inventorsInvestors";

const requiredFields = [
  "fullName",
  "location",
  "contactEmail",
  "phoneNumber",
  "shortBio",
  "investmentBudget",
  "investmentRangeMin",
  "investmentRangeMax",
  "lookingToInvestIn",
  "preferredIndustries",
  "stagePreference",
];

export function InvestorProfileSetupPage({
  t,
  values,
  onChange,
  onAvatarChange,
  onSubmit,
  onBack,
  submitting,
  uploadProgress,
}) {
  const errors = validateInvestorProfile(values);
  const completeness = calculateCompleteness(values, requiredFields);
  const previewList = values.avatarPreviewUrl ? [values.avatarPreviewUrl] : [];

  return (
    <FeatureFrame
      t={t}
      eyebrow="Step 2"
      title="Make your investor account"
      subtitle="Keep this clear and practical. You are telling inventors what kind of opportunities you actually want to see."
      actions={<SecondaryButton t={t} onClick={onBack}>Back</SecondaryButton>}
    >
      <SurfaceCard t={t}>
        <ProgressMeter t={t} percent={completeness} label="Investor profile" />

        <ImagePicker
          t={t}
          label="Profile photo"
          previews={previewList}
          onChange={onAvatarChange}
          error={errors.avatarFile}
          helperText="JPG, PNG, or WEBP. Max 5MB."
        />

        <SectionGrid>
          <TextField t={t} label="Full name" value={values.fullName} onChange={(value) => onChange("fullName", value)} placeholder="Your full name" error={errors.fullName} />
          <TextField t={t} label="Location / area" value={values.location} onChange={(value) => onChange("location", value)} placeholder="City, state, or region" error={errors.location} />
          <TextField t={t} label="Contact email" value={values.contactEmail} onChange={(value) => onChange("contactEmail", value)} placeholder="name@email.com" type="email" error={errors.contactEmail} />
          <TextField t={t} label="Phone number" value={values.phoneNumber} onChange={(value) => onChange("phoneNumber", value)} placeholder="Phone number" inputMode="tel" error={errors.phoneNumber} />
        </SectionGrid>

        <TextField t={t} label="Short bio" value={values.shortBio} onChange={(value) => onChange("shortBio", value)} placeholder="What kind of operator or investor are you?" error={errors.shortBio} multiline />

        <SectionGrid>
          <MoneyField t={t} label="Investment budget" value={values.investmentBudget} onChange={(value) => onChange("investmentBudget", value)} placeholder="$50,000" error={errors.investmentBudget} />
          <MoneyField t={t} label="Investment range minimum" value={values.investmentRangeMin} onChange={(value) => onChange("investmentRangeMin", value)} placeholder="$20,000" error={errors.investmentRangeMin} />
          <MoneyField t={t} label="Investment range maximum" value={values.investmentRangeMax} onChange={(value) => onChange("investmentRangeMax", value)} placeholder="$100,000" error={errors.investmentRangeMax} />
          <SelectField t={t} label="Stage preference" value={values.stagePreference} onChange={(value) => onChange("stagePreference", value)} options={INVESTOR_STAGE_OPTIONS} error={errors.stagePreference} />
        </SectionGrid>

        <TextField t={t} label="What are you looking to invest in?" value={values.lookingToInvestIn} onChange={(value) => onChange("lookingToInvestIn", value)} placeholder="SaaS, consumer products, service businesses, health tech" error={errors.lookingToInvestIn} multiline />
        <TextField t={t} label="Preferred industries / business categories" value={values.preferredIndustries} onChange={(value) => onChange("preferredIndustries", value)} placeholder="Comma separated industries" error={errors.preferredIndustries} />

        <ToggleField t={t} label="Make email public" checked={values.emailPublic} onChange={(value) => onChange("emailPublic", value)} hint="Off by default. Private unless you explicitly make it visible." />
        <ToggleField t={t} label="Make phone number public" checked={values.phonePublic} onChange={(value) => onChange("phonePublic", value)} hint="Off by default. Users can still message you in-app." />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PrimaryButton t={t} onClick={onSubmit} disabled={submitting || Object.keys(errors).length > 0} style={{ flex: 1 }}>
            {submitting ? `Saving${uploadProgress ? ` ${uploadProgress}%` : "..."}` : "Create Investor Account"}
          </PrimaryButton>
          <SecondaryButton t={t} onClick={onBack}>Back</SecondaryButton>
        </div>
      </SurfaceCard>
    </FeatureFrame>
  );
}
