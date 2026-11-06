import { Image } from 'expo-image';

import headerIcon from '../assets/center-icon.svg';
import panelIcon from '../assets/center-panel-icon.svg';

export function CenterIcon({ panel = false }: { panel?: boolean }) {
  const size = panel ? 20 : 16;
  return <Image source={panel ? panelIcon : headerIcon} style={{ width: size, height: size }} contentFit="contain" />;
}
