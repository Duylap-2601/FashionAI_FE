'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageLightboxProps {
  /** Image to show; `null` closes the lightbox. */
  image: { src: string; alt: string; caption?: string } | null;
  onClose: () => void;
}

/**
 * Full-size image view on an obsidian layer. Built on Radix so it stacks above other
 * dialogs (focus, Escape and outside clicks close only this layer).
 */
export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  return (
    <Dialog.Root open={Boolean(image)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-landing-obsidian/90 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-[121] flex flex-col items-center justify-center gap-3 p-4 outline-none sm:p-10"
          onClick={onClose}
        >
          <Dialog.Title className="sr-only">{image?.alt ?? 'Xem ảnh'}</Dialog.Title>
          <Dialog.Description className="sr-only">Bấm ra ngoài hoặc nhấn Esc để đóng.</Dialog.Description>
          <Dialog.Close
            aria-label="Đóng xem ảnh"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-[2px] text-landing-paper transition-colors hover:bg-landing-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-landing-paper"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Dialog.Close>
          {image ? (
            <>
              <div className="relative h-[78vh] w-full max-w-4xl">
                <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain" unoptimized />
              </div>
              {image.caption ? <p className="max-w-full truncate font-mono text-xs text-landing-paper/80">{image.caption}</p> : null}
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
