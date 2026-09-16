'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Download,
  ImagePlus,
  Move,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  ZoomIn,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const SIZE = 1254;
const PHOTO = { x: 339, y: 592, radius: 282 };

type Point = { x: number; y: number };

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLImageElement | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ pointer: Point; offset: Point } | null>(null);

  const [templateReady, setTemplateReady] = useState(false);
  const [fileName, setFileName] = useState('');
  const [photoReady, setPhotoReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const image = new Image();
    image.src = '/day-of-bliss-template.png';
    image.onload = () => {
      templateRef.current = image;
      setTemplateReady(true);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const template = templateRef.current;
    if (!canvas || !template) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, SIZE, SIZE);
    context.drawImage(template, 0, 0, SIZE, SIZE);
    const photo = photoRef.current;
    if (!photo) return;

    const diameter = PHOTO.radius * 2;
    const coverScale = Math.max(diameter / photo.width, diameter / photo.height);
    const width = photo.width * coverScale * zoom;
    const height = photo.height * coverScale * zoom;
    context.save();
    context.beginPath();
    context.arc(PHOTO.x, PHOTO.y, PHOTO.radius, 0, Math.PI * 2);
    context.clip();
    context.drawImage(photo, PHOTO.x - width / 2 + offset.x, PHOTO.y - height / 2 + offset.y, width, height);
    context.restore();
    context.save();
    context.beginPath();
    context.arc(PHOTO.x, PHOTO.y, PHOTO.radius - 1, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(255,255,255,.9)';
    context.lineWidth = 4;
    context.stroke();
    context.restore();
  }, [offset, zoom]);

  useEffect(() => {
    if (templateReady) draw();
  }, [draw, photoReady, templateReady]);

  const loadPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('That image is over 15 MB. Please choose a smaller file.');
      return;
    }
    setError('');
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      photoRef.current = image;
      setFileName(file.name);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setPhotoReady(true);
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      setError('We could not read that image. Try a JPG, PNG, or WebP file.');
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const getPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * SIZE, y: ((event.clientY - rect.top) / rect.height) * SIZE };
  };

  const startDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photoReady) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointer: getPointer(event), offset };
    setIsDragging(true);
  };

  const movePhoto = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const point = getPointer(event);
    setOffset({ x: dragRef.current.offset.x + point.x - dragRef.current.pointer.x, y: dragRef.current.offset.y + point.y - dragRef.current.pointer.y });
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !photoReady) return;
    const link = document.createElement('a');
    link.download = 'day-of-bliss-avatar.png';
    link.href = canvas.toDataURL('image/png', 1);
    link.click();
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-navy/8 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#" className="group flex items-center gap-3" aria-label="Avatar Studio home">
            <span className="grid size-10 place-items-center rounded-xl bg-navy text-white shadow-[0_8px_24px_rgba(13,38,76,.18)] transition-transform group-hover:-rotate-3"><Sparkles className="size-[19px]" strokeWidth={2.2} /></span>
            <span>
              <span className="block text-[15px] font-bold leading-none tracking-[-.02em] text-navy">Avatar Studio</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Day of Bliss</span>
            </span>
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><ShieldCheck className="size-3.5" />Your photo stays on this device</div>
        </div>
      </header>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 lg:px-12 lg:pb-20 lg:pt-14">
        <div className="pointer-events-none absolute -right-52 -top-44 size-[520px] rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-48 bottom-0 size-[440px] rounded-full bg-amber-100/55 blur-3xl" />
        <div className="relative mb-9 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-blue-700"><span className="size-1.5 rounded-full bg-blue-500" />Official event frame</div>
          <h1 className="font-heading text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[.98] tracking-[-.055em] text-navy">Put yourself in the <span className="text-blue-600">picture.</span></h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">Add your photo to the Day of Bliss artwork, fine-tune the crop, and download a share-ready image in seconds.</p>
        </div>

        <div className="relative grid items-start gap-7 lg:grid-cols-[minmax(300px,390px)_minmax(0,1fr)] xl:gap-10">
          <aside className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_70px_rgba(18,46,88,.08)] sm:p-7 lg:sticky lg:top-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Step 01</p><h2 className="mt-1.5 text-xl font-bold tracking-[-.025em] text-navy">Choose your photo</h2></div>
              {photoReady && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="size-4" strokeWidth={3} /></span>}
            </div>

            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => loadPhoto(event.target.files?.[0])} />
            <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); loadPhoto(event.dataTransfer.files[0]); }} className="group flex w-full flex-col items-center rounded-[20px] border border-dashed border-blue-300 bg-blue-50/45 px-5 py-8 text-center outline-none transition hover:border-blue-500 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-100">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-[0_8px_25px_rgba(37,99,235,.12)] transition-transform group-hover:-translate-y-0.5"><ImagePlus className="size-5" /></span>
              <span className="mt-4 text-sm font-bold text-navy">{photoReady ? 'Choose a different photo' : 'Drop a photo here'}</span>
              <span className="mt-1.5 text-xs text-slate-400">{photoReady ? fileName : 'or click to browse · JPG, PNG, WebP'}</span>
            </button>
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

            <div className={`mt-7 transition-opacity ${photoReady ? 'opacity-100' : 'pointer-events-none opacity-35'}`}>
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Step 02</p><h2 className="mt-1.5 text-lg font-bold tracking-[-.02em] text-navy">Perfect the fit</h2></div>
                <Button type="button" variant="ghost" size="sm" onClick={reset} className="rounded-full px-3 text-slate-500 hover:bg-slate-100"><RotateCcw className="size-3.5" />Reset</Button>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600"><span className="flex items-center gap-2"><ZoomIn className="size-3.5" /> Zoom</span><span className="rounded-md bg-white px-2 py-1 tabular-nums text-slate-500 shadow-sm">{Math.round(zoom * 100)}%</span></div>
                <Slider aria-label="Photo zoom" min={1} max={2.5} step={0.01} value={[zoom]} onValueChange={(value) => setZoom(Array.isArray(value) ? value[0] : value)} className="[&_[data-slot=slider-range]]:bg-blue-600 [&_[data-slot=slider-thumb]]:border-blue-600" />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-slate-400"><Move className="size-3.5 shrink-0" />Drag your photo directly in the preview to reposition it.</p>
            </div>

            <Button type="button" size="lg" disabled={!photoReady} onClick={download} className="mt-7 h-12 w-full rounded-xl bg-navy text-sm font-bold text-white shadow-[0_12px_30px_rgba(13,38,76,.18)] hover:bg-blue-700"><Download className="size-4" />Download your artwork</Button>
            <p className="mt-3 text-center text-[11px] text-slate-400">High-resolution PNG · ready to share</p>
          </aside>

          <section className="min-w-0 rounded-[30px] border border-white bg-white/70 p-3 shadow-[0_30px_90px_rgba(18,46,88,.1)] backdrop-blur-sm sm:p-5 xl:p-7" aria-label="Artwork preview">
            <div className="mb-4 flex items-center justify-between px-1 sm:px-2">
              <div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Live preview</p><p className="mt-1 text-sm font-semibold text-navy">Your Day of Bliss artwork</p></div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200"><span className="size-1.5 rounded-full bg-emerald-500" />1254 × 1254 px</span>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[760px] overflow-hidden rounded-[22px] bg-slate-100 shadow-[0_12px_38px_rgba(4,25,70,.16)] ring-1 ring-navy/8">
              {!templateReady && <div className="absolute inset-0 animate-pulse bg-slate-100" />}
              <canvas ref={canvasRef} width={SIZE} height={SIZE} onPointerDown={startDrag} onPointerMove={movePhoto} onPointerUp={endDrag} onPointerCancel={endDrag} className={`block h-full w-full touch-none select-none ${photoReady ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`} aria-label="Preview of your photo inside the Day of Bliss event template" />
              {!photoReady && templateReady && <button type="button" onClick={() => inputRef.current?.click()} className="absolute left-[27%] top-[47.2%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-xs font-bold text-white shadow-[0_12px_30px_rgba(4,25,70,.28)] transition hover:-translate-y-[55%] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"><Upload className="size-3.5" />Add your photo</button>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
