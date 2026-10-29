package com.hush.todo.ui.components

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import com.hush.todo.ui.theme.HushColors

/**
 * The dreamy supaste wallpaper. A sky gradient under a photo of rolling
 * hills, with soft aurora blobs and a fine film-grain overlay on top.
 * Place this as the first child of a Box that fills the screen.
 */
@Composable
fun Wallpaper(modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val bitmap: ImageBitmap = remember {
        ctx.assets.open("hills.jpg").use { BitmapFactory.decodeStream(it) }.asImageBitmap()
    }
    Box(
        modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    0.0f to HushColors.SkyTop,
                    0.32f to HushColors.SkyMid,
                    0.55f to HushColors.SkyLow,
                    0.72f to HushColors.SkyGlow,
                    0.95f to Color.Transparent,
                )
            )
    ) {
        Image(
            bitmap = bitmap,
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
        )
        // Aurora — two indigo pools and a warm peach pool
        Box(
            Modifier
                .fillMaxSize()
                .graphicsLayer { alpha = 0.55f }
                .drawWithContent {
                    drawContent()
                    val w = size.width; val h = size.height
                    drawCircle(
                        brush = Brush.radialGradient(
                            0f to HushColors.BrandPrimary.copy(alpha = 0.35f),
                            1f to Color.Transparent,
                            center = Offset(w * 0.2f, h * 0.1f),
                            radius = w * 0.6f,
                        ),
                        radius = w * 0.6f,
                        center = Offset(w * 0.2f, h * 0.1f),
                    )
                    drawCircle(
                        brush = Brush.radialGradient(
                            0f to HushColors.BrandLavender.copy(alpha = 0.28f),
                            1f to Color.Transparent,
                            center = Offset(w * 0.85f, h * 0.15f),
                            radius = w * 0.55f,
                        ),
                        radius = w * 0.55f,
                        center = Offset(w * 0.85f, h * 0.15f),
                    )
                    drawCircle(
                        brush = Brush.radialGradient(
                            0f to HushColors.SkyGlow.copy(alpha = 0.25f),
                            1f to Color.Transparent,
                            center = Offset(w * 0.5f, h * 1.0f),
                            radius = w * 0.6f,
                        ),
                        radius = w * 0.6f,
                        center = Offset(w * 0.5f, h * 1.0f),
                    )
                }
        )
        // Grain overlay — procedural dots, kept subtle
        Box(
            Modifier
                .fillMaxSize()
                .graphicsLayer { alpha = 0.08f }
                .drawWithContent {
                    drawContent()
                    val cell = 2.5f
                    val cols = (size.width / cell).toInt()
                    val rows = (size.height / cell).toInt()
                    val rand = java.util.Random(7L)
                    for (r in 0 until rows) {
                        for (c in 0 until cols) {
                            if (rand.nextInt(100) < 35) {
                                drawRect(
                                    color = Color.White,
                                    topLeft = Offset(c * cell, r * cell),
                                    size = Size(1f, 1f),
                                    blendMode = BlendMode.Overlay,
                                )
                            }
                        }
                    }
                },
        )
    }
}
