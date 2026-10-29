package com.hush.todo.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Palette lifted from supaste.com (verified against the live CSS tokens).
 * Dark theme is the default; light theme kept for parity.
 */
object HushColors {
    val Ink = Color(0xFF0D0D0D)
    val Paper = Color(0xFFF7F7F7)
    val BrandPrimary = Color(0xFF5F61ED)
    val BrandLavender = Color(0xFF9191FF)
    val BrandBlue = Color(0xFF006FFF)

    // Sky gradient stops lifted from the hero image
    val SkyTop = Color(0xFF1B7BD6)
    val SkyMid = Color(0xFF79BFFF)
    val SkyLow = Color(0xFFCFEAFF)
    val SkyGlow = Color(0xFFFFD8A8)

    // Priority dots
    val P1 = Color(0xFFF17D8E)
    val P2 = Color(0xFFF2C25B)
    val P3 = Color(0xFF8ECBF5)

    // Agent gold
    val AgentGold = Color(0xFFFFD88A)
    val AgentGoldFaint = Color(0xFF2A2516)
}
