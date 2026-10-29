package com.hush.todo.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkScheme = darkColorScheme(
    primary = HushColors.BrandPrimary,
    onPrimary = Color.White,
    secondary = HushColors.BrandLavender,
    onSecondary = HushColors.Ink,
    background = HushColors.Ink,
    onBackground = Color.White,
    surface = Color(0xFF111118),
    onSurface = Color.White,
)

private val LightScheme = lightColorScheme(
    primary = HushColors.BrandPrimary,
    onPrimary = Color.White,
    secondary = HushColors.BrandLavender,
    onSecondary = HushColors.Ink,
    background = HushColors.Paper,
    onBackground = HushColors.Ink,
    surface = Color.White,
    onSurface = HushColors.Ink,
)

@Composable
fun HushTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkScheme else LightScheme,
        typography = HushTypography,
        content = content
    )
}
