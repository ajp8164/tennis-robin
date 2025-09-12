import {
  Ban,
  Frown,
  LucideIcon,
  Mail,
  Palmtree,
  Smile,
} from 'lucide-react-native';

// Typically used to work with EnumPicker.
export const appIcons = {
  Ban,
  Frown,
  Mail,
  Palmtree,
  Smile,
} as const satisfies Record<string, LucideIcon>;
