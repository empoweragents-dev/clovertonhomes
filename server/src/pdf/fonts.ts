import { Font } from "@react-pdf/renderer";
import { resolveAssetPath } from "./assets";

/**
 * Registers the document fonts once per process.
 *
 * Static TTFs are vendored under public/fonts/pdf/ rather than loaded from the Google
 * Fonts CDN the way the website does: PDF generation happens server-side, must work
 * offline, and must never depend on fonts installed on a viewer's machine.
 *
 * Static instances (not variable fonts) are used on purpose — react-pdf's fontkit does
 * not instance variable axes reliably, and a wrong weight in a client-facing legal
 * document is not an acceptable failure mode.
 */
export const FONT_BODY = "Inter";
export const FONT_HEADING = "Outfit";

let registered = false;

export function registerPdfFonts(): void {
    if (registered) return;

    Font.register({
        family: FONT_BODY,
        fonts: [
            { src: resolveAssetPath("fonts/pdf/Inter_400Regular.ttf"), fontWeight: 400 },
            { src: resolveAssetPath("fonts/pdf/Inter_400Regular_Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
            { src: resolveAssetPath("fonts/pdf/Inter_600SemiBold.ttf"), fontWeight: 600 },
            { src: resolveAssetPath("fonts/pdf/Inter_700Bold.ttf"), fontWeight: 700 },
        ],
    });

    Font.register({
        family: FONT_HEADING,
        fonts: [
            { src: resolveAssetPath("fonts/pdf/Outfit_600SemiBold.ttf"), fontWeight: 600 },
            { src: resolveAssetPath("fonts/pdf/Outfit_700Bold.ttf"), fontWeight: 700 },
        ],
    });

    // react-pdf hyphenates aggressively by default, which chops words mid-line and
    // looks like a rendering defect in a tender. Return the word unsplit.
    Font.registerHyphenationCallback((word) => [word]);

    registered = true;
}
