import gallery from "@/content/gallery.json";

export type GalleryImage = {
  src: string;
  title: string;
  category: string;
  alt: string;
};

export function getGalleryData() {
  return gallery as {
    intro: string;
    categories: string[];
    images: GalleryImage[];
  };
}
