# 10x10 Studio Preview

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

The local development URL is http://127.0.0.1:3000. On the root route, the HUD boots automatically and settles on S1. The scroll track then becomes available. Scroll down to advance through S2 and S3, or up to return to S1. The HUD stays in view for three viewport heights of native scrolling. Reduced motion shows S3 immediately without adding a scroll track.

## HUD preview

In development, add `?loader=1`, `?loader=2` or `?loader=3` to pause at the matching reference frame. Open `/?controls=1` to play the full intro with the inspector, or combine it with a state query such as `/?loader=2&controls=1`. Inspector mode runs independently of scroll and includes state buttons, Play, Pause, Restart and a seek slider. Use `/?motion=reduce` to exercise the immediate final-frame branch in development. The production route ignores these parameters and follows the system motion preference.

`src/components/loader/LoaderArtwork.tsx` owns the SVG design space and static geometry. `IronManLoader.tsx` manages GSAP lifecycle and developer controls. `createLoaderTimeline.ts` sequences motion using the labels in `loaderConfig.ts`. `HelmetArtwork.tsx` preserves the supplied SVG paths and fills. The 10x10 logo is the supplied standalone SVG. The supplied Bai Jamjuree font is self-hosted as WOFF2.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```

## Structure

- `src/app` contains App Router routes, the server root layout, Tailwind's global stylesheet and crawler directives.
- `src/components` reserves folders for layout, UI, animation wrappers and page sections. Keep components on the server unless they need browser APIs.
- `src/lib/animations` contains the opt-in GSAP entry point. Keep timeline construction separate from markup where useful. Import this module from animated Client Components only.
- `src/hooks`, `src/lib/utils`, `src/styles` and `src/types` are reserved for shared code as it emerges.
- `public/assets` separates SVGs, images, fonts and videos.

## Animation conventions

Scope `useGSAP` to a component ref so timelines and ScrollTriggers created inside it revert on unmount. Use `revertOnUpdate` for timelines that need to rebuild with dependencies and `contextSafe` for callbacks that create GSAP work after setup. Clean up any independent listeners, timers and animation frames in their owning component.

Use `gsap.matchMedia()` for responsive timelines and `prefers-reduced-motion`. Revert the media context during cleanup and provide a stable final state when motion is reduced. Prefer CSS for simple motion and use Tailwind's `motion-safe` and `motion-reduce` variants as needed. Keep inline SVG where individual paths, masks or clips need animation. Import morphing plugins only when a design calls for them. Use Next Image for supported raster assets and `next/font/local` once fonts are supplied.

## Crawlers

`robots.txt` disallows all crawlers and explicitly names the requested AI agents. Root metadata adds noindex, nofollow, noarchive, nosnippet and noimageindex. Next.js sends `X-Robots-Tag: noindex, nofollow` across routes.

These voluntary directives provide no access control. A crawler following the robots.txt block may never see the page's noindex directives.
