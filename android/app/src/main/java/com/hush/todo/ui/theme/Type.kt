package com.hush.todo.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.hush.todo.R

val InstrumentSerif = FontFamily(
    Font(R.font.instrument_serif_regular, FontWeight.Normal, FontStyle.Normal),
    Font(R.font.instrument_serif_italic, FontWeight.Normal, FontStyle.Italic),
)

val Inter = FontFamily(
    Font(R.font.inter_regular),
)

val FragmentMono = FontFamily(
    Font(R.font.fragment_mono_regular),
)

object HushType {
    val DisplayHuge = TextStyle(fontFamily = InstrumentSerif, fontSize = 72.sp, lineHeight = 72.sp, letterSpacing = (-1).sp)
    val DisplayHugeItalic = TextStyle(fontFamily = InstrumentSerif, fontSize = 72.sp, fontStyle = FontStyle.Italic, lineHeight = 72.sp, letterSpacing = (-1).sp)
    val DisplayLarge = TextStyle(fontFamily = InstrumentSerif, fontSize = 44.sp, lineHeight = 44.sp)
    val DisplayLargeItalic = TextStyle(fontFamily = InstrumentSerif, fontSize = 44.sp, fontStyle = FontStyle.Italic, lineHeight = 44.sp)
    val DisplayMedium = TextStyle(fontFamily = InstrumentSerif, fontSize = 32.sp, lineHeight = 36.sp)
    val DisplayMediumItalic = TextStyle(fontFamily = InstrumentSerif, fontSize = 32.sp, fontStyle = FontStyle.Italic, lineHeight = 36.sp)

    val HeroBlack = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Black, fontSize = 72.sp, lineHeight = 70.sp, letterSpacing = (-1).sp)

    val Mono = TextStyle(fontFamily = FragmentMono, fontSize = 11.sp, lineHeight = 14.sp)
    val MonoSmall = TextStyle(fontFamily = FragmentMono, fontSize = 10.sp, lineHeight = 12.sp)
}

val HushTypography = Typography(
    bodyLarge = TextStyle(fontFamily = Inter, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontFamily = Inter, fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontFamily = Inter, fontSize = 12.sp, lineHeight = 16.sp),
    titleLarge = TextStyle(fontFamily = Inter, fontWeight = FontWeight.SemiBold, fontSize = 18.sp),
    titleMedium = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 15.sp),
    labelMedium = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 12.sp),
    labelSmall = TextStyle(fontFamily = FragmentMono, fontSize = 10.sp),
)
