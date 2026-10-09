import PaperPhoto from "@/components/paper-photo";

interface Props {
  title: string;
  image: string | null;
}

// Newsprint photo: black and white (sepia nudges the greyed tile back to
// warm bone), full colour when the parent `group` is hovered. Touch screens
// can't hover, so they always get full colour.
export default function ProductMedia({ title, image }: Props) {
  if (image) {
    return (
      <PaperPhoto
        src={image}
        alt={title}
        width={800}
        className="absolute inset-0 [@media(hover:hover)]:grayscale [@media(hover:hover)]:sepia-[.08] group-hover:grayscale-0 group-hover:sepia-0 transition-[filter] duration-300"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="tag text-faded">Photo soon</span>
    </div>
  );
}
