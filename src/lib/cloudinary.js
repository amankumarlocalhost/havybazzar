export function cloudinaryUrl(fileKey) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${fileKey}`;
}
