import Image from 'next/image';

/**
 * Logo — poore product me sirf yahi component use hota hai (navbar, footer,
 * auth panels, admin). Do variants hain kyunki asli logo files me plate
 * background baked hai (transparent PNG nahi hai):
 *
 *   onDark  -> /logo-dark.png   (black plate)  — jet black surfaces ke liye
 *   onLight -> /logo-light.png  (white plate)  — white/light surfaces ke liye
 *
 * Height className se control karein (h-5, h-6...), width apne aap
 * aspect ratio se aayegi — isliye dono files ka ratio jaan-boojh kar
 * ek jaisa (~12:1) rakha gaya hai, taaki variant badalne pe layout na hile.
 */

const VARIANTS = {
  onDark: { src: '/logo-dark.png', width: 827, height: 70 },
  onLight: { src: '/logo-light.png', width: 910, height: 76 },
};

export default function Logo({ variant = 'onDark', className = 'h-6 w-auto', priority = false }) {
  const { src, width, height } = VARIANTS[variant] || VARIANTS.onDark;

  return (
    <Image
      src={src}
      alt="Heavy Bazar"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
