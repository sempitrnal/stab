import Image from "next/image";

interface Props {
  title: string;
  image: string | null;
  priority?: boolean;
}

// Newsprint photo: black and white, full colour when the parent `group`
// is hovered. Multiplied so white backdrops sink into the paper.
export default function ProductMedia({ title, image, priority }: Props) {
  if (image) {
    return (
      <Image
        src={image}
        alt={title}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-contain p-[6%] mix-blend-multiply grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-[filter] duration-300"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="tag text-faded">Photo soon</span>
    </div>
  );
}
