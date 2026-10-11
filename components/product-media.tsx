import PaperPhoto from "@/components/paper-photo";

interface Props {
  title: string;
  image: string | null;
  slug?: string;
  /** Tile background class (see PaperPhoto). */
  tile?: string;
  /** Space between the photo and the tile edge. */
  inset?: string;
  /** Second photo, faded in over the first while the card is hovered. */
  hoverImage?: string | null;
}

// Product photo on its tile, white backdrop blended away.
export default function ProductMedia({
  title,
  image,
  slug,
  tile,
  inset,
  hoverImage,
}: Props) {
  if (image) {
    return (
      <>
        <PaperPhoto
          src={image}
          alt={title}
          slug={slug}
          tile={tile}
          inset={inset}
          width={800}
          className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {hoverImage && (
          <PaperPhoto
            src={hoverImage}
            alt=""
            slug={slug}
            tile={tile}
            inset={inset}
            width={800}
            className="absolute inset-0 opacity-0 transition-[opacity,transform] duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        )}
      </>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="tag text-faded">Photo soon</span>
    </div>
  );
}
