import {
  Ban,
  Frown,
  LucideIcon,
  Mail,
  Palmtree,
  Smile,
  Users,
} from 'lucide-react-native';

// Typically used to work with EnumPicker.
export const appIcons = {
  Ban,
  Frown,
  Mail,
  Palmtree,
  Smile,
  Users,
} as const satisfies Record<string, LucideIcon>;
