import PaperPhoto from "@/components/paper-photo";

interface Props {
  title: string;
  image: string | null;
  slug?: string;
}

// Product photo on its tile, white backdrop blended away.
export default function ProductMedia({ title, image, slug }: Props) {
  if (image) {
    return (
      <PaperPhoto
        src={image}
        alt={title}
        slug={slug}
        width={800}
        className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="tag text-faded">Photo soon</span>
    </div>
  );
}
