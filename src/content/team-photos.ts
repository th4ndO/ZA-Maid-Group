import amahle from "@/assets/team-amahle-mbali-zibane.jpg";
import amukelani from "@/assets/team-amukelani-shabangu.jpg";
import mvuni from "@/assets/team-mvuni-mdoka.jpg";
import precious from "@/assets/team-precious-musuamba-mujanay.jpg";
import zoleka from "@/assets/team-zoleka-kene.jpg";
import zinhle from "@/assets/team-zinhle-mdluli.jpg";
import type { TeamPhoto } from "@/content/site";

// Headshots are square, cropped with scripts/headshot.py so faces line up. Used on the About
// page and in the booker's "choose your cleaner" step.
export const teamPhotos: Record<TeamPhoto, typeof zinhle> = { zinhle, precious, amahle, zoleka, mvuni, amukelani };

export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};
