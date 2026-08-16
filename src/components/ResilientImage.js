"use client";

import Image from "next/image";
import { useState } from "react";

export default function ResilientImage({ src, fallbackSrc, alt, onError, ...props }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = failed || !src ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        if (resolvedSrc !== fallbackSrc) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
