import { Bike, CircleDot, Disc, Dumbbell, Feather, Flower, Footprints, Music, Sparkles, Volleyball, Waves, type LucideProps } from "lucide-react";
import { ACTIVITY_ART, DEFAULT_ACTIVITY_ART, type ActivityIconName } from "@/lib/constants";

const ICONS: Record<ActivityIconName, React.ComponentType<LucideProps>> = {
  footprints: Footprints,
  dumbbell: Dumbbell,
  bike: Bike,
  feather: Feather,
  "circle-dot": CircleDot,
  disc: Disc,
  waves: Waves,
  music: Music,
  volleyball: Volleyball,
  flower: Flower,
  sparkles: Sparkles,
};

export function ActivityIcon({ activityKey, ...props }: { activityKey: string } & LucideProps) {
  const art = ACTIVITY_ART[activityKey] ?? DEFAULT_ACTIVITY_ART;
  const Icon = ICONS[art.icon];
  return <Icon aria-hidden="true" {...props} />;
}
