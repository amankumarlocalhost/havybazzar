// Minimal hand-rolled icon set (24x24, stroke-based) so the project has
// consistent iconography without adding an external icon dependency.

function Svg({ children, className = 'h-5 w-5', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p) => <Svg {...p}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const ChevronDownIcon = (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
export const ChevronRightIcon = (p) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;
export const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>;
export const UserIcon = (p) => <Svg {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5" /></Svg>;
export const LogoutIcon = (p) => <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Svg>;
export const HomeIcon = (p) => <Svg {...p}><path d="M4 11.5L12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" /></Svg>;
export const PackageIcon = (p) => <Svg {...p}><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Svg>;
export const UsersIcon = (p) => <Svg {...p}><circle cx="9" cy="8" r="3.25" /><path d="M2.75 19c1.2-3.3 4-4.75 6.25-4.75s5.05 1.45 6.25 4.75" /><path d="M15.5 5.2A3.25 3.25 0 1 1 16.7 11.5" /><path d="M16.2 14.3c2 .35 3.9 1.7 4.85 4.2" /></Svg>;
export const ShieldCheckIcon = (p) => <Svg {...p}><path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" /><path d="M9 12l2 2 4-4.5" /></Svg>;
export const TagIcon = (p) => <Svg {...p}><path d="M12.6 3H6a2 2 0 0 0-2 2v6.6c0 .53.2 1.04.58 1.42l8.4 8.4a2 2 0 0 0 2.83 0l6.6-6.6a2 2 0 0 0 0-2.83l-8.4-8.4A2 2 0 0 0 12.6 3Z" /><circle cx="8.2" cy="8.2" r="1.4" /></Svg>;
export const FileTextIcon = (p) => <Svg {...p}><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9 13h6M9 17h6M9 9h2" /></Svg>;
export const LifeBuoyIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="M5.1 5.1l4.2 4.2M18.9 5.1l-4.2 4.2M5.1 18.9l4.2-4.2M18.9 18.9l-4.2-4.2" /></Svg>;
export const WalletIcon = (p) => <Svg {...p}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V8H5.5A2.5 2.5 0 0 1 3 5.5" /><path d="M3 8h15.5A2.5 2.5 0 0 1 21 10.5v6a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5V8Z" /><circle cx="16.25" cy="13.5" r="1.1" fill="currentColor" stroke="none" /></Svg>;
export const ChartIcon = (p) => <Svg {...p}><path d="M4 20V10M11 20V4M18 20v-7" /><path d="M2.5 20h19" /></Svg>;
export const BellIcon = (p) => <Svg {...p}><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 6.5H4.5C4.5 14.5 6 13 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Svg>;
export const HeartIcon = (p) => <Svg {...p}><path d="M12 20s-7.5-4.6-9.7-9.1C.9 7.6 2.2 4 5.6 3.3c2-.4 3.9.5 5 2.1a5 5 0 0 1 1.4-1.5c1.2-1 3-1.5 4.7-1.1 3.4.7 4.7 4.3 3.3 7.6C17.9 15.4 12 20 12 20Z" /></Svg>;
export const GavelIcon = (p) => <Svg {...p}><path d="M14.5 3.5l6 6M9.5 8.5l6 6M4 20l6-6" /><path d="M6 13l5-5 3 3-5 5-3-3Z" /><path d="M2 22h8" /></Svg>;
export const TruckIcon = (p) => <Svg {...p}><path d="M3 7h10v9H3z" /><path d="M13 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></Svg>;
export const MapPinIcon = (p) => <Svg {...p}><path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></Svg>;
export const ClockIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>;
export const CheckCircleIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.3l2.3 2.3 4.7-5.1" /></Svg>;
export const AlertTriangleIcon = (p) => <Svg {...p}><path d="M10.6 3.9L1.9 19a1.6 1.6 0 0 0 1.4 2.4h17.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.9a1.6 1.6 0 0 0-2.8 0Z" /><path d="M12 9.5v4.2M12 17.2h.01" /></Svg>;
export const UploadIcon = (p) => <Svg {...p}><path d="M12 16V4M7.5 8.5L12 4l4.5 4.5" /><path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" /></Svg>;
export const PlusIcon = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const ArrowRightIcon = (p) => <Svg {...p}><path d="M4.5 12h15M13.5 5.5L20 12l-6.5 6.5" /></Svg>;
export const StoreIcon = (p) => <Svg {...p}><path d="M4 9.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5" /><path d="M2.5 5l1.2-2h16.6l1.2 2" /><path d="M2.5 5c0 2-1.2 4.5 1.6 4.5S6.9 7 6.9 5c0 2 1 4.5 3.1 4.5S13.1 7 13.1 5c0 2 1 4.5 3.1 4.5S19.9 7 19.9 5c.8 2.5.6 4.5-1.6 4.5" /><path d="M9.5 21v-6h5v6" /></Svg>;
export const SettingsIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .35 1.9l.05.05a2 2 0 1 1-2.8 2.8l-.05-.05a1.7 1.7 0 0 0-1.9-.35 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.35l-.05.05a2 2 0 1 1-2.8-2.8l.05-.05a1.7 1.7 0 0 0 .35-1.9 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.35-1.9l-.05-.05a2 2 0 1 1 2.8-2.8l.05.05a1.7 1.7 0 0 0 1.9.35H10a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.9-.35l.05-.05a2 2 0 1 1 2.8 2.8l-.05.05a1.7 1.7 0 0 0-.35 1.9v.1a1.7 1.7 0 0 0 1.55 1H19.5a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.55 1Z" /></Svg>;
export const LayersIcon = (p) => <Svg {...p}><path d="M12 3l8.5 5-8.5 5-8.5-5L12 3Z" /><path d="M3.5 13l8.5 5 8.5-5" /><path d="M3.5 17.5l8.5 5 8.5-5" /></Svg>;
export const ClipboardListIcon = (p) => <Svg {...p}><path d="M8 4h8v3H8z" /><path d="M6 6h1.5M16.5 6H18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1" /><path d="M8 12h8M8 15.5h8M8 8.5h4" /></Svg>;
export const RupeeIcon = (p) => <Svg {...p}><path d="M6 4h11M6 8h11M8 4c4 0 6.5 1.4 6.5 4.2S12 12.4 8 12.4h-1L15 20" /></Svg>;
export const StarIcon = (p) => <Svg {...p}><path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.3l-5.4 3 1-6-4.4-4.4 6.1-.9L12 3.5Z" /></Svg>;
export const BuildingIcon = (p) => <Svg {...p}><path d="M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16" /><path d="M13 10h5a1 1 0 0 1 1 1v10" /><path d="M8 7.5h.01M11 7.5h.01M8 10.5h.01M11 10.5h.01M8 13.5h.01M11 13.5h.01M16.5 13.5h.01M16.5 16.5h.01M3 21h18" /></Svg>;
export const InboxIcon = (p) => <Svg {...p}><path d="M3.5 12.5h5l1.5 3h4l1.5-3h5" /><path d="M5.5 6h13l2 6.5V18a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18v-5.5L5.5 6Z" /></Svg>;
export const EyeIcon = (p) => <Svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.75" /></Svg>;
export const DownloadIcon = (p) => <Svg {...p}><path d="M12 4v12M7.5 11.5L12 16l4.5-4.5" /><path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" /></Svg>;
export const FilterIcon = (p) => <Svg {...p}><path d="M4 5h16M7 12h10M10.5 19h3" /></Svg>;
export const TrendUpIcon = (p) => <Svg {...p}><path d="M3 16l6-6 4 4 8-9" /><path d="M15 5h6v6" /></Svg>;
