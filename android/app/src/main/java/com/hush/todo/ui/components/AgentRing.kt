package com.hush.todo.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.hush.todo.ui.theme.HushColors

@Composable
fun AgentRing(
    cornerRadius: Dp,
    modifier: Modifier = Modifier,
    stroke: Dp = 2.dp,
) {
    val transition = rememberInfiniteTransition(label = "ring")
    val angle by transition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(4000, easing = LinearEasing), RepeatMode.Restart),
        label = "angle"
    )
    Box(
        modifier
            .fillMaxSize()
            .graphicsLayer { rotationZ = angle }
            .drawWithContent {
                val brush = Brush.sweepGradient(
                    0.0f to HushColors.AgentGold.copy(alpha = 0f),
                    0.25f to HushColors.AgentGold.copy(alpha = 0.9f),
                    0.5f to HushColors.AgentGold,
                    0.75f to HushColors.AgentGold.copy(alpha = 0.9f),
                    1.0f to HushColors.AgentGold.copy(alpha = 0f),
                    center = Offset(size.width / 2f, size.height / 2f),
                )
                drawRoundRect(
                    brush = brush,
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(cornerRadius.toPx()),
                    style = Stroke(width = stroke.toPx()),
                )
            }
    )
}

@Composable
fun StillAgentBorder(cornerRadius: Dp, modifier: Modifier = Modifier) {
    Box(
        modifier
            .fillMaxSize()
            .drawWithContent {
                drawRoundRect(
                    color = Color(0xFFFFD88A).copy(alpha = 0.6f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(cornerRadius.toPx()),
                    style = Stroke(width = 1.5.dp.toPx()),
                )
            }
    )
}
