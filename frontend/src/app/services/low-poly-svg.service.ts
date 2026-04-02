import { Injectable } from '@angular/core';

/** Supported hobby types for low-poly SVG generation. */
export type HobbyType = 'gaming' | 'manga' | 'volley' | 'musique';

/**
 * Generates low-poly SVG illustrations for each hobby card.
 * Each hobby produces a recognizable faceted shape — controller, book,
 * volleyball, or headphones — with varied fill opacities to simulate
 * 3D lighting on flat triangular faces.
 *
 * Results are cached so each hobby+color pair is computed only once.
 */
@Injectable({ providedIn: 'root' })
export class LowPolySvgService {
  private readonly cache = new Map<string, string>();

  /**
   * Return an inline SVG string for the given hobby illustration.
   * The SVG uses the provided accentColor (a CSS value, e.g. "var(--hobby-cyan)")
   * with varied fill-opacity per triangle to create the faceted 3D look.
   */
  generateHobbySvg(hobby: HobbyType, accentColor: string): string {
    const key = `${hobby}:${accentColor}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    let content: string;
    switch (hobby) {
      case 'gaming':
        content = this.buildGaming(accentColor);
        break;
      case 'manga':
        content = this.buildManga(accentColor);
        break;
      case 'volley':
        content = this.buildVolley(accentColor);
        break;
      case 'musique':
        content = this.buildMusique(accentColor);
        break;
    }

    const svg = `<svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
    this.cache.set(key, svg);
    return svg;
  }

  /** Create a triangular polygon with faceted lighting. */
  private tri(points: string, c: string, opacity: number): string {
    return `<polygon points="${points}" fill="${c}" fill-opacity="${opacity}" stroke="${c}" stroke-opacity="0.06" stroke-width="0.5"/>`;
  }

  /** Create a filled circle. */
  private dot(cx: number, cy: number, r: number, c: string, opacity: number): string {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="${opacity}"/>`;
  }

  /** Create a filled rectangle. */
  private box(x: number, y: number, w: number, h: number, c: string, opacity: number, rx = 0): string {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}" fill-opacity="${opacity}"/>`;
  }

  /** Create a stroke-only path (for seams, waves, lines). */
  private line(d: string, c: string, opacity: number, width = 1): string {
    return `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
  }

  /**
   * Game controller (front view).
   * 15 body triangles + D-pad and face buttons.
   * Light source: upper-left — top-center faces are brightest.
   */
  private buildGaming(c: string): string {
    return [
      // Top dome — brightest faces (direct light)
      this.tri('330,80 400,80 365,115', c, 0.11),
      this.tri('330,80 275,130 365,115', c, 0.08),
      this.tri('400,80 365,115 455,130', c, 0.09),
      // Upper body — well-lit faces
      this.tri('275,130 260,190 340,170', c, 0.06),
      this.tri('275,130 365,115 340,170', c, 0.10),
      this.tri('365,115 340,170 395,170', c, 0.12),
      this.tri('365,115 455,130 395,170', c, 0.09),
      this.tri('455,130 395,170 470,190', c, 0.05),
      // Mid body — transitional lighting
      this.tri('260,190 340,170 310,250', c, 0.07),
      this.tri('340,170 395,170 365,250', c, 0.08),
      this.tri('395,170 470,190 420,250', c, 0.06),
      // Grips — deepest shadow
      this.tri('260,190 270,295 310,250', c, 0.04),
      this.tri('270,295 310,250 295,340', c, 0.03),
      this.tri('470,190 460,295 420,250', c, 0.04),
      this.tri('460,295 420,250 435,340', c, 0.03),
      // D-pad (left stick area)
      this.box(310, 180, 18, 5, c, 0.08, 1),
      this.box(316, 174, 5, 18, c, 0.08, 1),
      // Face buttons (right stick area)
      this.dot(408, 165, 4, c, 0.10),
      this.dot(420, 177, 4, c, 0.08),
      this.dot(396, 177, 4, c, 0.10),
    ].join('');
  }

  /**
   * Open book with flying pages (slight perspective from above).
   * 10 body triangles (left page + right page + spine) + 3 flying pages.
   * Right page faces the light → brighter opacities.
   */
  private buildManga(c: string): string {
    return [
      // Left page — shadow side (4 facets)
      this.tri('235,185 360,165 300,240', c, 0.07),
      this.tri('235,185 300,240 240,310', c, 0.05),
      this.tri('300,240 360,165 360,310', c, 0.06),
      this.tri('300,240 240,310 360,310', c, 0.04),
      // Right page — lit side (4 facets)
      this.tri('360,165 475,180 420,230', c, 0.12),
      this.tri('475,180 420,230 470,305', c, 0.10),
      this.tri('420,230 360,165 360,310', c, 0.09),
      this.tri('420,230 470,305 360,310', c, 0.08),
      // Spine (2 thin triangles)
      this.tri('356,160 364,160 364,315', c, 0.04),
      this.tri('356,160 356,315 364,315', c, 0.03),
      // Flying pages — thin elongated triangles above the book
      this.tri('275,125 335,110 320,155', c, 0.07),
      this.tri('355,88 415,75 400,120', c, 0.09),
      this.tri('420,100 470,92 455,138', c, 0.06),
      // Page edge accents
      this.box(255, 190, 90, 2, c, 0.05, 1),
      this.box(375, 185, 85, 2, c, 0.06, 1),
    ].join('');
  }

  /**
   * Volleyball — icosphere approximation.
   * 7 inner facets (center to inner ring) + 11 outer facets + seam strokes.
   * 3 offset motion-trail triangles suggest the ball is in flight.
   */
  private buildVolley(c: string): string {
    return [
      // Inner ring — 7 facets radiating from center (380,190)
      this.tri('380,190 380,130 420,148', c, 0.10),
      this.tri('380,190 420,148 448,188', c, 0.08),
      this.tri('380,190 448,188 428,238', c, 0.05),
      this.tri('380,190 428,238 372,252', c, 0.04),
      this.tri('380,190 372,252 322,228', c, 0.06),
      this.tri('380,190 322,228 332,162', c, 0.09),
      this.tri('380,190 332,162 380,130', c, 0.11),
      // Outer ring — 11 facets connecting inner vertices to outer boundary
      this.tri('380,130 420,148 408,98', c, 0.09),
      this.tri('380,130 408,98 355,102', c, 0.07),
      this.tri('380,130 355,102 332,162', c, 0.06),
      this.tri('420,148 448,188 472,158', c, 0.05),
      this.tri('448,188 472,158 478,212', c, 0.04),
      this.tri('448,188 478,212 428,238', c, 0.03),
      this.tri('428,238 372,252 412,282', c, 0.03),
      this.tri('372,252 412,282 348,278', c, 0.04),
      this.tri('372,252 348,278 322,228', c, 0.05),
      this.tri('322,228 332,162 298,178', c, 0.07),
      this.tri('332,162 298,178 312,132', c, 0.08),
      // Seams — slightly more visible strokes (0.10 opacity)
      this.line('M 355,102 L 380,130 L 408,98', c, 0.10),
      this.line('M 332,162 L 380,190 L 420,148', c, 0.10),
      this.line('M 322,228 L 380,190 L 448,188', c, 0.10),
      this.line('M 372,252 L 380,190 L 332,162', c, 0.10),
      // Motion trail — 3 offset triangles (lower-right, suggesting flight)
      this.tri('418,288 448,302 435,322', c, 0.04),
      this.tri('445,298 468,312 458,332', c, 0.03),
      this.tri('465,308 484,318 478,342', c, 0.02),
    ].join('');
  }

  /**
   * Headphones — arc band (8 triangles) + 2 ear cups (5 each) + sound waves.
   * Arc curves from left to right over the top. Light source: above-center.
   */
  private buildMusique(c: string): string {
    return [
      // Headband arc — 8 triangles between outer (A) and inner (B) curves
      // Segment 1: left
      this.tri('268,210 308,125 282,202', c, 0.06),
      this.tri('308,125 282,202 316,135', c, 0.08),
      // Segment 2: upper-left
      this.tri('308,125 348,82 316,135', c, 0.10),
      this.tri('348,82 316,135 352,95', c, 0.11),
      // Segment 3: top center (brightest)
      this.tri('348,82 405,82 352,95', c, 0.12),
      this.tri('405,82 352,95 400,95', c, 0.11),
      // Segment 4: upper-right
      this.tri('405,82 448,125 400,95', c, 0.09),
      this.tri('448,125 400,95 440,135', c, 0.07),
      // Segment 5: right (joining to ear cup)
      this.tri('448,125 482,210 468,202', c, 0.05),
      this.tri('448,125 468,202 440,135', c, 0.06),
      // Left ear cup — 5 facets around center (278,260)
      this.tri('252,228 305,228 278,260', c, 0.09),
      this.tri('305,228 312,265 278,260', c, 0.07),
      this.tri('312,265 288,295 278,260', c, 0.05),
      this.tri('288,295 248,278 278,260', c, 0.04),
      this.tri('248,278 252,228 278,260', c, 0.06),
      // Right ear cup — 5 facets around center (468,260)
      this.tri('442,228 492,228 468,260', c, 0.08),
      this.tri('492,228 498,265 468,260', c, 0.06),
      this.tri('498,265 478,295 468,260', c, 0.04),
      this.tri('478,295 438,278 468,260', c, 0.05),
      this.tri('438,278 442,228 468,260', c, 0.07),
      // Sound waves — curved strokes emanating from ear cups
      this.line('M 242,242 Q 225,260 242,278', c, 0.06),
      this.line('M 232,230 Q 210,260 232,290', c, 0.05),
      this.line('M 498,242 Q 515,260 498,278', c, 0.06),
      this.line('M 508,230 Q 530,260 508,290', c, 0.05),
    ].join('');
  }
}
