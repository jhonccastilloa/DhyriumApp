import {
  type IconWeight,
  ArrowClockwiseIcon,
  BuildingsIcon,
  CalendarCheckIcon,
  CaretDownIcon,
  CheckIcon,
  CircleNotchIcon,
  ClipboardTextIcon,
  CloudArrowUpIcon,
  DotsThreeOutlineIcon,
  DotsSixVerticalIcon,
  DoorIcon,
  FilePdfIcon,
  FileTextIcon,
  FilesIcon,
  FolderOpenIcon,
  ForkKnifeIcon,
  FunnelIcon,
  HardHatIcon,
  HouseIcon,
  IdentificationCardIcon,
  LinkSimpleIcon,
  ListChecksIcon,
  PencilSimpleIcon,
  ReceiptIcon,
  RulerIcon,
  ScanIcon,
  ShareNetworkIcon,
  SortAscendingIcon,
  UserIcon,
  UserGearIcon,
  CalendarBlankIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  WarningIcon,
  PercentIcon,
  EnvelopeIcon,
  SignOutIcon,
  CurrencyDollarIcon,
  UsersThreeIcon,
  SlidersHorizontalIcon,
  UserCircleIcon,
  PlusIcon,
  MoneyIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  HandTapIcon,
  HandArrowUpIcon,
  HandArrowDownIcon,
  XIcon,
  ClockIcon,
  AddressBookIcon,
  TrashIcon,
  PencilIcon,
  LockIcon,
  CreditCardIcon,
  PaletteIcon,
  GlobeIcon,
  KeyIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  WarningCircleIcon,
  VideoIcon,
  ToolboxIcon,
  EyeIcon,
  EyeSlashIcon,
} from 'phosphor-react-native';
import Sol from '@/assets/icons/Sol.svg';
import Logo from '@/assets/icons/Logo.svg';

export type IconVariant =
  | 'default'
  | 'active'
  | 'muted'
  | 'featured';

interface IconProps {
  size: number;
  color: string;
  variant?: IconVariant;
}

const iconVariantWeight: Record<IconVariant, IconWeight> = {
  default: 'regular',
  active: 'fill',
  muted: 'regular',
  featured: 'duotone',
};

const getIconWeight = (variant: IconVariant = 'default'): IconWeight =>
  iconVariantWeight[variant];

const iconRegistry = {
  none: () => <></>,
  home: (props: IconProps) => (
    <HouseIcon
      color={props.color}
      size={props.size}
      weight={getIconWeight(props.variant)}
    />
  ),
  toolbox: (props: IconProps) => (
    <ToolboxIcon
      color={props.color}
      size={props.size}
      weight={getIconWeight(props.variant)}
    />
  ),
  dotsThreeOutline: (props: IconProps) => (
    <DotsThreeOutlineIcon
      color={props.color}
      size={props.size}
      weight={getIconWeight(props.variant)}
    />
  ),
  buildings: (props: IconProps) => (
    <BuildingsIcon color={props.color} size={props.size} />
  ),
  calendarCheck: (props: IconProps) => (
    <CalendarCheckIcon color={props.color} size={props.size} />
  ),
  check: (props: IconProps) => (
    <CheckIcon color={props.color} size={props.size} weight="bold" />
  ),
  checkCircle: (props: IconProps) => (
    <CheckCircleIcon
      color={props.color}
      size={props.size}
      weight={getIconWeight(props.variant)}
    />
  ),
  clipboardText: (props: IconProps) => (
    <ClipboardTextIcon color={props.color} size={props.size} />
  ),
  cloudArrowUp: (props: IconProps) => (
    <CloudArrowUpIcon color={props.color} size={props.size} />
  ),
  door: (props: IconProps) => <DoorIcon color={props.color} size={props.size} />,
  dotsSixVertical: (props: IconProps) => (
    <DotsSixVerticalIcon color={props.color} size={props.size} weight="bold" />
  ),
  filePdf: (props: IconProps) => (
    <FilePdfIcon
      color={props.color}
      size={props.size}
      weight={getIconWeight(props.variant)}
    />
  ),
  fileText: (props: IconProps) => (
    <FileTextIcon color={props.color} size={props.size} />
  ),
  files: (props: IconProps) => <FilesIcon color={props.color} size={props.size} />,
  folderOpen: (props: IconProps) => (
    <FolderOpenIcon color={props.color} size={props.size} weight="duotone" />
  ),
  forkKnife: (props: IconProps) => (
    <ForkKnifeIcon color={props.color} size={props.size} />
  ),
  funnel: (props: IconProps) => (
    <FunnelIcon
      color={props.color}
      size={props.size}
      weight={getIconWeight(props.variant)}
    />
  ),
  hardHat: (props: IconProps) => (
    <HardHatIcon color={props.color} size={props.size} />
  ),
  identificationCard: (props: IconProps) => (
    <IdentificationCardIcon color={props.color} size={props.size} />
  ),
  linkSimple: (props: IconProps) => (
    <LinkSimpleIcon color={props.color} size={props.size} />
  ),
  listChecks: (props: IconProps) => (
    <ListChecksIcon color={props.color} size={props.size} />
  ),
  pencilSimple: (props: IconProps) => (
    <PencilSimpleIcon color={props.color} size={props.size} weight="duotone" />
  ),
  receipt: (props: IconProps) => (
    <ReceiptIcon color={props.color} size={props.size} />
  ),
  ruler: (props: IconProps) => <RulerIcon color={props.color} size={props.size} />,
  scan: (props: IconProps) => (
    <ScanIcon color={props.color} size={props.size} weight="duotone" />
  ),
  shareNetwork: (props: IconProps) => (
    <ShareNetworkIcon color={props.color} size={props.size} />
  ),
  sortAscending: (props: IconProps) => (
    <SortAscendingIcon color={props.color} size={props.size} />
  ),
  userGear: (props: IconProps) => (
    <UserGearIcon color={props.color} size={props.size} />
  ),
  video: (props: IconProps) => <VideoIcon color={props.color} size={props.size} />,
  warningCircle: (props: IconProps) => (
    <WarningCircleIcon color={props.color} size={props.size} weight="duotone" />
  ),
  circleNotch: (props: IconProps) => (
    <CircleNotchIcon color={props.color} size={props.size} weight="duotone" />
  ),
  arrowClockwise: (props: IconProps) => (
    <ArrowClockwiseIcon color={props.color} size={props.size} />
  ),
  caretDown: (props: IconProps) => (
    <CaretDownIcon color={props.color} size={props.size} weight="bold" />
  ),
  sol: (props: IconProps) => (
    <Sol fill={props.color} width={props.size} height={props.size} />
  ),
  money: (props: IconProps) => (
    <MoneyIcon color={props.color} size={props.size} />
  ),

  signOut: (props: IconProps) => (
    <SignOutIcon color={props.color} size={props.size} />
  ),
  key: (props: IconProps) => <KeyIcon color={props.color} size={props.size} />,
  eye: (props: IconProps) => <EyeIcon color={props.color} size={props.size} />,
  eyeSlash: (props: IconProps) => (
    <EyeSlashIcon color={props.color} size={props.size} />
  ),
  sun: (props: IconProps) => <SunIcon color={props.color} size={props.size} />,
  moon: (props: IconProps) => <MoonIcon color={props.color} size={props.size} />,
  desktop: (props: IconProps) => (
    <DesktopIcon color={props.color} size={props.size} />
  ),
  palette: (props: IconProps) => (
    <PaletteIcon color={props.color} size={props.size} />
  ),
  global: (props: IconProps) => (
    <GlobeIcon color={props.color} size={props.size} />
  ),
  user: (props: IconProps) => (
    <UserIcon color={props.color} size={props.size} />
  ),
  trash: (props: IconProps) => (
    <TrashIcon color={props.color} size={props.size} />
  ),
  creditCard: (props: IconProps) => (
    <CreditCardIcon color={props.color} size={props.size} />
  ),
  pencil: (props: IconProps) => (
    <PencilIcon color={props.color} size={props.size} />
  ),
  lock: (props: IconProps) => (
    <LockIcon color={props.color} size={props.size} />
  ),

  addressBook: (props: IconProps) => (
    <AddressBookIcon color={props.color} size={props.size} />
  ),
  plus: (props: IconProps) => (
    <PlusIcon color={props.color} size={props.size} weight="bold" />
  ),
  handArrowUp: (props: IconProps) => (
    <HandArrowUpIcon color={props.color} size={props.size} />
  ),
  handArrowDown: (props: IconProps) => (
    <HandArrowDownIcon color={props.color} size={props.size} />
  ),
  caretRight: (props: IconProps) => (
    <CaretRightIcon color={props.color} size={props.size} weight="bold" />
  ),
  handTap: (props: IconProps) => (
    <HandTapIcon color={props.color} size={props.size} weight="bold" />
  ),
  userCircle: (props: IconProps) => (
    <UserCircleIcon color={props.color} size={props.size} />
  ),
  usersThree: (props: IconProps) => (
    <UsersThreeIcon color={props.color} size={props.size} />
  ),
  slidersHorizontal: (props: IconProps) => (
    <SlidersHorizontalIcon color={props.color} size={props.size} />
  ),

  envelope: (props: IconProps) => (
    <EnvelopeIcon color={props.color} size={props.size} />
  ),
  currencyDollar: (props: IconProps) => (
    <CurrencyDollarIcon color={props.color} size={props.size} weight="bold" />
  ),
  arrowLeft: (props: IconProps) => (
    <ArrowLeftIcon color={props.color} size={props.size} weight="bold" />
  ),

  percent: (props: IconProps) => (
    <PercentIcon color={props.color} size={props.size} weight="bold" />
  ),
  calendarBlank: (props: IconProps) => (
    <CalendarBlankIcon color={props.color} size={props.size} />
  ),
  search: (props: IconProps) => (
    <MagnifyingGlassIcon color={props.color} size={props.size} />
  ),
  close: (props: IconProps) => (
    <XIcon color={props.color} size={props.size} weight="bold" />
  ),
  closeLight: (props: IconProps) => (
    <XIcon color={props.color} size={props.size} />
  ),
  clock: (props: IconProps) => (
    <ClockIcon color={props.color} size={props.size} />
  ),
  toastSuccess: (props: IconProps) => (
    <CheckCircleIcon color={props.color} size={props.size} weight="fill" />
  ),
  toastError: (props: IconProps) => (
    <XCircleIcon color={props.color} size={props.size} weight="fill" />
  ),
  toastInfo: (props: IconProps) => (
    <InfoIcon color={props.color} size={props.size} weight="fill" />
  ),
  toastWarning: (props: IconProps) => (
    <WarningIcon color={props.color} size={props.size} weight="fill" />
  ),

  myLogo: (props: IconProps) => (
    <Logo fill={props.color} width={props.size} height={props.size} />
  ),
} as const;

export type IconName = keyof typeof iconRegistry;
export default iconRegistry;
