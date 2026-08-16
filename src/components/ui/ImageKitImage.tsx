"use client";

import Image, { ImageProps } from "next/image";
import imageKitLoader from "@/utils/imagekit-loader";

/**
 * Client component wrapper cho next/image với custom loader.
 * Dùng khi cần gọi next/image kèm custom loader bên trong Server Component,
 * vì Server Component không thể truyền function (loader) xuống Client Component (next/image).
 */
export default function ImageKitImage(props: Omit<ImageProps, "loader">) {
    return <Image loader={imageKitLoader} {...props} />;
}
