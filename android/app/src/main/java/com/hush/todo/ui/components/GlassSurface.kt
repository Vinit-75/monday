package com.hush.todo.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Translucent glass panel. On API 31+ this uses hardware blur via
 * Modifier.blur on a backdrop sibling; here we approximate with a
 * dark/light tinted fill + thin inner border for the frosted look,
 * which reads correctly on any surface including photos.
 */
@Composable
fun GlassSurface(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(20.dp),
    strong: Boolean = false,
    padding: PaddingValues = PaddingValues(0.dp),
    content: @Composable () -> Unit,
) {
    val tint = if (strong) Color(0xB50D0D0D) else Color(0x8C0D0D0D)
    Box(
        modifier
            .clip(shape)
            .border(BorderStroke(1.dp, Color(0x1AFFFFFF)), shape)
            .then(Modifier.padding(padding))
    ) {
        // Fill
        Box(
            Modifier
                .matchParentSize()
                .clip(shape)
                .border(BorderStroke(0.5.dp, Color(0x14FFFFFF)), shape)
        ) {
            androidx.compose.foundation.Canvas(Modifier.matchParentSize()) {
                drawRect(color = tint)
            }
        }
        content()
    }
}

fun Modifier.rounded(radius: Dp): Modifier = clip(RoundedCornerShape(radius))
