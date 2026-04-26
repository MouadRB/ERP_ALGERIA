package com.dz.erp.catalog.category.domain.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Pure static utility — no Spring, no dependencies.
 * Generates URL-safe slugs from French and Arabic text.
 */
public final class SlugGenerator {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w\\s-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern EDGE_DASHES = Pattern.compile("^-+|-+$");

    private SlugGenerator() {}

    /**
     * French slug: "Accessoires iPhone" → "accessoires-iphone"
     * Strips accents, lowercases, replaces spaces with hyphens.
     */
    public static String generate(String text) {
        if (text == null || text.isBlank()) return "";
        var normalized = Normalizer.normalize(text, Normalizer.Form.NFKD);
        normalized = normalized.replaceAll("\\p{M}", ""); // strip combining marks (accents)
        normalized = normalized.toLowerCase().trim();
        normalized = NON_LATIN.matcher(normalized).replaceAll("");
        normalized = WHITESPACE.matcher(normalized).replaceAll("-");
        normalized = EDGE_DASHES.matcher(normalized).replaceAll("");
        return normalized;
    }

    /**
     * Arabic slug: preserves Arabic characters, replaces spaces with hyphens.
     * Arabic text does not have accents to strip, but we normalize whitespace.
     */
    public static String generateAr(String text) {
        if (text == null || text.isBlank()) return "";
        var normalized = text.trim();
        // Keep Arabic characters (\u0600-\u06FF), digits, hyphens
        normalized = normalized.replaceAll("[^\\u0600-\\u06FF\\w\\s-]", "");
        normalized = WHITESPACE.matcher(normalized).replaceAll("-");
        normalized = EDGE_DASHES.matcher(normalized).replaceAll("");
        return normalized;
    }
}
