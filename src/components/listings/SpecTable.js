const GROUP_LABELS = {
  general: 'General',
  engine: 'Engine',
  hydraulic: 'Hydraulic',
  cabin: 'Cabin',
  undercarriage: 'Undercarriage',
};

const FIELD_LABELS = {
  referenceNumber: 'Reference No.',
  brand: 'Brand',
  type: 'Type',
  typeExtended: 'Type (Extended)',
  productionYear: 'Production Year',
  hoursOnMeter: 'Hours on Meter',
  totalWeightKg: 'Total Weight (kg)',
  systemType: 'System Type',
  quickCouplerBrand: 'Quick Coupler Brand',
  quickCouplerType: 'Quick Coupler Type',
  hasAirSuspensionSeat: 'Air Suspension Seat',
  hasAirConditioning: 'Air Conditioning',
  shoesWidthMm: 'Shoes Width (mm)',
  tracksWidthMm: 'Tracks Width (mm)',
  cylinderCount: 'Cylinder Count',
};

function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value;
}

export default function SpecTable({ specifications }) {
  if (!specifications) return null;

  const groups = Object.entries(specifications).filter(
    ([, fields]) => fields && Object.keys(fields).length > 0
  );

  if (groups.length === 0) return null;

  return (
    <div className="space-y-6">
      {groups.map(([groupKey, fields]) => (
        <div key={groupKey}>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {GROUP_LABELS[groupKey] || groupKey}
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-surface p-4 sm:grid-cols-3">
            {Object.entries(fields).map(([fieldKey, value]) =>
              value === undefined || value === null || value === '' ? null : (
                <div key={fieldKey}>
                  <dt className="text-xs text-slate-500">{FIELD_LABELS[fieldKey] || fieldKey}</dt>
                  <dd className="text-sm font-medium text-slate-900">{formatValue(value)}</dd>
                </div>
              )
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
