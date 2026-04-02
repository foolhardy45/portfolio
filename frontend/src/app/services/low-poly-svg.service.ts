import { Injectable } from '@angular/core';

/** Supported hobby types for low-poly SVG generation. */
export type HobbyType = 'gaming' | 'manga' | 'volley' | 'musique';

/**
 * Generates recognizable low-poly SVG illustrations for each hobby card.
 * Every shape is built from faceted triangles with shared vertices and
 * varied fill-opacity (0.06–0.25) to simulate 3D lighting from the upper-left.
 * Results are cached per hobby+color pair.
 */
@Injectable({ providedIn: 'root' })
export class LowPolySvgService {
  private readonly cache = new Map<string, string>();

  /** Return an inline SVG string for the given hobby illustration. */
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

  /** Triangular polygon with faceted fill and edge stroke. */
  private t(points: string, c: string, o: number): string {
    return `<polygon points="${points}" fill="${c}" fill-opacity="${o}" stroke="${c}" stroke-opacity="0.10" stroke-width="0.5"/>`;
  }

  /** Filled circle. */
  private ci(cx: number, cy: number, r: number, c: string, o: number): string {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="${o}"/>`;
  }

  /** Stroke-only circle. */
  private cis(cx: number, cy: number, r: number, c: string, o: number, w = 0.5): string {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}"/>`;
  }

  /** Stroke-only path. */
  private p(d: string, c: string, o: number, w = 1): string {
    return `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}"/>`;
  }

  /** Horizontal line segment. */
  private ln(x1: number, y1: number, x2: number, y2: number, c: string, o: number): string {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-opacity="${o}" stroke-width="0.5"/>`;
  }

  /** SVG text element. */
  private txt(x: number, y: number, text: string, c: string, o: number, size = 16): string {
    return `<text x="${x}" y="${y}" fill="${c}" fill-opacity="${o}" font-size="${size}">` +
      `${text}</text>`;
  }

  /** Filled ellipse. */
  private el(cx: number, cy: number, rx: number, ry: number, c: string, o: number): string {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" fill-opacity="${o}"/>`;
  }

  // ─── GAMING — controller front view ────────────────────────────

  /**
   * Gamepad seen from front: wide body, two grips, D-pad, ABXY buttons,
   * two analog sticks, two shoulder triggers. 28+ triangles total.
   * Light source: upper-left.
   */
  private buildGaming(c: string): string {
    return [
      // ── BODY: wide central rectangle decomposed into ~12 triangles ──
      // Top edge row (brightest — facing light)
      this.t('220,145 340,130 280,185', c, 0.22),
      this.t('340,130 460,145 400,185', c, 0.20),
      this.t('340,130 280,185 400,185', c, 0.25),
      // Middle row
      this.t('220,145 280,185 210,230', c, 0.18),
      this.t('280,185 400,185 340,235', c, 0.20),
      this.t('280,185 210,230 340,235', c, 0.15),
      this.t('400,185 460,145 470,230', c, 0.14),
      this.t('400,185 470,230 340,235', c, 0.12),
      // Bottom edge row (shadow)
      this.t('210,230 340,235 270,270', c, 0.10),
      this.t('340,235 270,270 410,270', c, 0.09),
      this.t('340,235 470,230 410,270', c, 0.08),

      // ── LEFT GRIP: 5 triangles ──
      this.t('210,230 270,270 215,280', c, 0.12),
      this.t('215,280 270,270 230,320', c, 0.10),
      this.t('230,320 270,270 260,340', c, 0.08),
      this.t('230,320 260,340 240,360', c, 0.07),
      this.t('240,360 260,340 270,355', c, 0.06),

      // ── RIGHT GRIP: 5 triangles ──
      this.t('470,230 410,270 465,280', c, 0.11),
      this.t('465,280 410,270 450,320', c, 0.09),
      this.t('450,320 410,270 420,340', c, 0.08),
      this.t('450,320 420,340 440,360', c, 0.07),
      this.t('440,360 420,340 415,355', c, 0.06),

      // ── LEFT TRIGGER: 2 triangles ──
      this.t('230,130 220,145 280,140', c, 0.18),
      this.t('230,130 280,140 290,125', c, 0.22),

      // ── RIGHT TRIGGER: 2 triangles ──
      this.t('450,130 460,145 400,140', c, 0.16),
      this.t('450,130 400,140 390,125', c, 0.20),

      // ── D-PAD (upper-left of body): 6 small triangles in cross ──
      // Center of D-pad: (285, 195)
      this.t('285,182 278,195 292,195', c, 0.20),  // top
      this.t('278,195 285,208 270,195', c, 0.16),  // left
      this.t('292,195 285,208 300,195', c, 0.14),  // right
      this.t('285,208 278,195 292,195', c, 0.12),  // bottom
      this.t('270,195 278,195 275,185', c, 0.18),  // top-left arm
      this.t('300,195 292,195 295,185', c, 0.15),  // top-right arm

      // ── ABXY BUTTONS (upper-right, diamond pattern) ──
      this.ci(400, 178, 5, c, 0.22),  // top (Y)
      this.ci(412, 192, 5, c, 0.18),  // right (B)
      this.ci(388, 192, 5, c, 0.18),  // left (X)
      this.ci(400, 205, 5, c, 0.14),  // bottom (A)

      // ── ANALOG STICKS: 2 circles ──
      this.ci(310, 230, 12, c, 0.15),
      this.cis(310, 230, 12, c, 0.18),
      this.ci(380, 250, 12, c, 0.12),
      this.cis(380, 250, 12, c, 0.16),
    ].join('');
  }

  // ─── MANGA — open book with flying pages ───────────────────────

  /**
   * Open book in perspective (V shape), flying loose pages above,
   * text lines on pages, scattered sparkle particles. 26+ triangles.
   */
  private buildManga(c: string): string {
    return [
      // ── LEFT PAGE: 7 triangles (shadow side) ──
      this.t('200,195 345,175 270,220', c, 0.14),
      this.t('200,195 270,220 195,260', c, 0.12),
      this.t('270,220 345,175 310,260', c, 0.13),
      this.t('195,260 270,220 230,300', c, 0.10),
      this.t('270,220 310,260 280,300', c, 0.09),
      this.t('230,300 270,220 280,300', c, 0.08),
      this.t('195,260 230,300 200,330', c, 0.07),
      this.t('230,300 280,300 250,340', c, 0.06),

      // ── RIGHT PAGE: 7 triangles (lit side) ──
      this.t('355,175 480,190 420,220', c, 0.24),
      this.t('480,190 420,220 475,260', c, 0.22),
      this.t('420,220 355,175 390,260', c, 0.20),
      this.t('475,260 420,220 460,300', c, 0.18),
      this.t('420,220 390,260 415,300', c, 0.16),
      this.t('460,300 420,220 415,300', c, 0.14),
      this.t('475,260 460,300 480,330', c, 0.12),
      this.t('460,300 415,300 440,340', c, 0.10),

      // ── SPINE: 4 thin triangles ──
      this.t('345,170 355,170 355,340', c, 0.10),
      this.t('345,170 345,340 355,340', c, 0.08),
      this.t('348,170 352,170 350,180', c, 0.18),
      this.t('348,340 352,340 350,330', c, 0.06),

      // ── FLYING PAGES: 3 parallelogram shapes (2 tri each) ──
      // Page 1 — tilted 10°
      this.t('260,130 340,115 335,138', c, 0.16),
      this.t('260,130 335,138 255,152', c, 0.13),
      // Page 2 — tilted 25°
      this.t('330,85 420,68 410,94', c, 0.20),
      this.t('330,85 410,94 325,108', c, 0.17),
      // Page 3 — tilted -15°
      this.t('400,100 470,108 465,130', c, 0.14),
      this.t('400,100 465,130 395,125', c, 0.11),

      // ── TEXT LINES on left page ──
      this.ln(215, 230, 295, 222, c, 0.08),
      this.ln(210, 248, 285, 240, c, 0.08),
      this.ln(218, 268, 278, 258, c, 0.08),
      this.ln(222, 288, 270, 278, c, 0.08),

      // ── TEXT LINES on right page ──
      this.ln(380, 218, 460, 224, c, 0.08),
      this.ln(385, 238, 455, 244, c, 0.08),
      this.ln(390, 258, 450, 264, c, 0.08),
      this.ln(395, 278, 445, 284, c, 0.08),

      // ── SPARKLE PARTICLES ──
      this.ci(290, 95, 2, c, 0.15),
      this.ci(380, 55, 2.5, c, 0.12),
      this.ci(450, 80, 2, c, 0.14),
      this.ci(230, 110, 1.5, c, 0.10),
      this.ci(475, 120, 1.5, c, 0.12),
    ].join('');
  }

  // ─── VOLLEY — ball in flight ───────────────────────────────────

  /**
   * Volleyball: dodecagon approximation (18 facets), seam strokes,
   * speed lines, impact sparks, ground shadow. 24+ triangles.
   */
  private buildVolley(c: string): string {
    // Ball center (350, 180), radius ~85
    // 10 outer vertices + center
    const cx = 350, cy = 180;
    return [
      // ── BALL: 10-sided polygon split into 18 facets ──
      // Inner triangles (center to midpoints)
      this.t('350,180 350,120 390,130', c, 0.24),
      this.t('350,180 390,130 420,160', c, 0.22),
      this.t('350,180 420,160 430,200', c, 0.18),
      this.t('350,180 430,200 410,235', c, 0.14),
      this.t('350,180 410,235 370,250', c, 0.10),
      this.t('350,180 370,250 315,245', c, 0.09),
      this.t('350,180 315,245 280,215', c, 0.12),
      this.t('350,180 280,215 275,175', c, 0.16),
      this.t('350,180 275,175 300,140', c, 0.20),
      this.t('350,180 300,140 350,120', c, 0.23),

      // Outer triangles (midpoints to boundary)
      this.t('350,120 390,130 380,95', c, 0.22),
      this.t('390,130 420,160 435,135', c, 0.18),
      this.t('420,160 430,200 450,180', c, 0.14),
      this.t('430,200 410,235 445,225', c, 0.10),
      this.t('410,235 370,250 395,270', c, 0.08),
      this.t('370,250 315,245 340,275', c, 0.07),
      this.t('315,245 280,215 270,240', c, 0.09),
      this.t('280,215 275,175 255,190', c, 0.13),
      this.t('275,175 300,140 265,150', c, 0.17),
      this.t('300,140 350,120 320,100', c, 0.21),

      // ── SEAMS: curved strokes (volleyball panel lines) ──
      this.p('M 320,100 Q 350,145 380,95', c, 0.15, 1),
      this.p('M 435,135 Q 400,175 445,225', c, 0.15, 1),
      this.p('M 395,270 Q 360,225 270,240', c, 0.15, 1),
      this.p('M 265,150 Q 310,180 340,275', c, 0.15, 1),

      // ── SPEED LINES (left side, ball moving right) ──
      this.p('M 220,155 Q 190,170 215,190', c, 0.12, 1.5),
      this.p('M 200,175 Q 165,190 195,210', c, 0.10, 1.5),
      this.p('M 230,200 Q 200,210 228,225', c, 0.08, 1.5),

      // ── IMPACT SPARKS (right side) ──
      this.t('455,140 470,130 465,148', c, 0.16),
      this.t('460,240 478,235 470,250', c, 0.14),
      this.t('445,270 455,260 458,275', c, 0.12),

      // ── GROUND SHADOW ──
      this.el(355, 310, 70, 12, c, 0.04),
    ].join('');
  }

  // ─── MUSIQUE — headphones ──────────────────────────────────────

  /**
   * Headphones: arc headband (10 triangles), two ear cups (6 each),
   * inner cushions, concentric sound waves, music notes. 30+ elements.
   */
  private buildMusique(c: string): string {
    return [
      // ── HEADBAND ARC: 10 triangles ──
      // Outer arc: O1..O6, Inner arc: I1..I6
      this.t('225,215 265,140 240,205', c, 0.12),
      this.t('265,140 240,205 275,150', c, 0.15),
      this.t('265,140 310,90 275,150', c, 0.18),
      this.t('310,90 275,150 320,102', c, 0.20),
      this.t('310,90 360,72 320,102', c, 0.23),
      this.t('360,72 320,102 368,85', c, 0.25),
      this.t('360,72 415,72 368,85', c, 0.25),
      this.t('415,72 368,85 408,85', c, 0.23),
      this.t('415,72 460,90 408,85', c, 0.20),
      this.t('460,90 408,85 450,102', c, 0.18),
      this.t('460,90 490,140 450,102', c, 0.15),
      this.t('490,140 450,102 480,150', c, 0.12),
      this.t('490,140 500,215 480,205', c, 0.10),
      this.t('490,140 480,205 480,150', c, 0.08),

      // ── LEFT EAR CUP: 6 outer triangles around center (245, 268) ──
      this.t('215,230 275,230 245,268', c, 0.20),
      this.t('275,230 288,265 245,268', c, 0.17),
      this.t('288,265 272,300 245,268', c, 0.13),
      this.t('272,300 218,295 245,268', c, 0.10),
      this.t('218,295 205,260 245,268', c, 0.12),
      this.t('205,260 215,230 245,268', c, 0.15),
      // Inner cushion
      this.ci(245, 268, 18, c, 0.04),
      this.cis(245, 268, 18, c, 0.10),

      // ── RIGHT EAR CUP: 6 outer triangles around center (480, 268) ──
      this.t('450,230 508,230 480,268', c, 0.18),
      this.t('508,230 520,265 480,268', c, 0.15),
      this.t('520,265 505,300 480,268', c, 0.11),
      this.t('505,300 455,295 480,268', c, 0.09),
      this.t('455,295 440,260 480,268', c, 0.11),
      this.t('440,260 450,230 480,268', c, 0.14),
      // Inner cushion
      this.ci(480, 268, 18, c, 0.04),
      this.cis(480, 268, 18, c, 0.10),

      // ── SOUND WAVES (concentric arcs from left ear cup) ──
      this.p('M 195,245 Q 170,268 195,292', c, 0.15, 1.5),
      this.p('M 182,232 Q 150,268 182,305', c, 0.10, 1.5),
      this.p('M 168,218 Q 128,268 168,318', c, 0.06, 1.5),

      // ── SOUND WAVES (from right ear cup) ──
      this.p('M 530,245 Q 555,268 530,292', c, 0.15, 1.5),
      this.p('M 542,232 Q 575,268 542,305', c, 0.10, 1.5),
      this.p('M 555,218 Q 598,268 555,318', c, 0.06, 1.5),

      // ── MUSIC NOTES ──
      this.txt(175, 215, '\u266A', c, 0.14, 18),
      this.txt(155, 280, '\u266B', c, 0.10, 14),
      this.txt(545, 220, '\u266A', c, 0.12, 16),
    ].join('');
  }
}
