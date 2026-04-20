import {
  FeatureFrame,
  ImagePicker,
  MoneyField,
  PrimaryButton,
  ProgressMeter,
  SectionGrid,
  SecondaryButton,
  SurfaceCard,
  TextField,
  ToggleField,
} from "../InventorsInvestorsUI";
import {
  calculateCompleteness,
  validateInventorProfile,
} from "../../../utils/inventorsInvestors";

const requiredFields = [
  "fullName",
  "location",
  "contactEmail",
  "phoneNumber",
  "inventionName",
  "inventionType",
  "description",
  "revenue",
  "equityAvailable",
  "fundingSought",
  "category",
  "shortPitch",
];

export function InventorProfileSetupPage({
  t,
  values,
  onChange,
  onAvatarChange,
  onGalleryChange,
  onSubmit,
  onBack,
  submitting,
  uploadProgress,
}) {
  const errors = validateInventorProfile(values);
  const completeness = calculateCompleteness(values, requiredFields);

  return (
    <FeatureFrame
      t={t}
      eyebrow="Step 2"
      title="Make your inventor account"
      subtitle="Show enough signal for a serious investor to understand what the business or invention is, what it is doing now, and what capital could unlock next."
      actions={<SecondaryButton t={t} onClick={onBack}>Back</SecondaryButton>}
    >
      <SurfaceCard t={t}>
        <ProgressMeter t={t} percent={completeness} label="Inventor profile" />

        <ImagePicker
          t={t}
          label="Profile photo"
          previews={values.avatarPreviewUrl ? [values.avatarPreviewUrl] : []}
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

        <SectionGrid>
          <TextField t={t} label="Invention or business name" value={values.inventionName} onChange={(value) => onChange("inventionName", value)} placeholder="Brand or invention name" error={errors.inventionName} />
          <TextField t={t} label="Business or invention type" value={values.inventionType} onChange={(value) => onChange("inventionType", value)} placeholder="SaaS, manufacturing, creator brand, platform" error={errors.inventionType} />
          <MoneyField t={t} label="Current income / revenue" value={values.revenue} onChange={(value) => onChange("revenue", value)} placeholder="$1,000" error={errors.revenue} />
          <TextField t={t} label="Amount of equity available" value={values.equityAvailable} onChange={(value) => onChange("equityAvailable", value)} placeholder="10" inputMode="decimal" error={errors.equityAvailable} />
          <MoneyField t={t} label="Funding sought" value={values.fundingSought} onChange={(value) => onChange("fundingSought", value)} placeholder="$10,000" error={errors.fundingSought} />
          <TextField t={t} label="Business category / industry" value={values.category} onChange={(value) => onChange("category", value)} placeholder="Finance, education, health, consumer" error={errors.category} />
        </SectionGrid>

        <TextField t={t} label="Short pitch summary" value={values.shortPitch} onChange={(value) => onChange("shortPitch", value)} placeholder="One strong summary sentence or two." error={errors.shortPitch} multiline />
        <TextField t={t} label="Full description of the invention / business" value={values.description} onChange={(value) => onChange("description", value)} placeholder="Explain the product, traction, market, and what makes it worth backing." error={errors.description} multiline />

        <ImagePicker
          t={t}
          label="Photos of the business / invention"
          multiple
          previews={values.galleryPreviewUrls}
          onChange={onGalleryChange}
          error={errors.galleryFiles}
          helperText="Add multiple images. JPG, PNG, or WEBP. Max 7MB each."
        />

        <SectionGrid>
          <TextField t={t} label="Website URL" value={values.websiteUrl} onChange={(value) => onChange("websiteUrl", value)} placeholder="https://your-site.com" error={errors.websiteUrl} />
          <TextField t={t} label="Website URL or social links" value={values.socialLinks} onChange={(value) => onChange("socialLinks", value)} placeholder="Comma separated URLs or handles" />
        </SectionGrid>

        <ToggleField t={t} label="Make email public" checked={values.emailPublic} onChange={(value) => onChange("emailPublic", value)} hint="Off by default. Private unless you explicitly make it visible." />
        <ToggleField t={t} label="Make phone number public" checked={values.phonePublic} onChange={(value) => onChange("phonePublic", value)} hint="Off by default. Users can still message you in-app." />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PrimaryButton t={t} onClick={onSubmit} disabled={submitting || Object.keys(errors).length > 0} style={{ flex: 1 }}>
            {submitting ? `Saving${uploadProgress ? ` ${uploadProgress}%` : "..."}` : "Create Inventor Account"}
          </PrimaryButton>
          <SecondaryButton t={t} onClick={onBack}>Back</SecondaryButton>
        </div>
      </SurfaceCard>
    </FeatureFrame>
  );
}
