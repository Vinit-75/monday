package com.hush.todo.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hush.todo.ui.components.GlassSurface
import com.hush.todo.ui.components.Wallpaper
import com.hush.todo.ui.theme.FragmentMono
import com.hush.todo.ui.theme.HushColors
import com.hush.todo.ui.theme.HushType
import com.hush.todo.ui.theme.Inter

@Composable
fun LandingScreen(onEnter: () -> Unit) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    Box(Modifier.fillMaxSize()) {
        Wallpaper()

        // Soft radial scrim behind the hero so the text reads
        Box(
            Modifier
                .align(Alignment.TopCenter)
                .padding(top = 80.dp)
                .size(width = 420.dp, height = 480.dp)
                .graphicsLayer { alpha = 0.95f }
                .drawWithContent {
                    drawCircle(
                        brush = Brush.radialGradient(
                            0f to Color(0x8C000000),
                            0.55f to Color(0x40000000),
                            1f to Color.Transparent,
                            center = Offset(size.width / 2f, size.height / 2f),
                            radius = size.width * 0.55f,
                        )
                    )
                }
        )

        Column(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(top = 56.dp, bottom = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // Floating nav pill
            GlassSurface(
                shape = CircleShape,
                strong = true,
                modifier = Modifier.padding(top = 12.dp),
            ) {
                Row(
                    Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Box(
                        Modifier
                            .size(22.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(HushColors.Ink),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            "h",
                            color = Color.White,
                            fontFamily = FragmentMono,
                            fontStyle = FontStyle.Italic,
                            fontSize = 13.sp
                        )
                    }
                    Text("Hush", color = Color.White, fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 13.sp)
                }
            }

            Spacer(Modifier.height(44.dp))

            // Chip
            GlassSurface(shape = CircleShape, strong = false) {
                Row(
                    Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Box(Modifier.size(6.dp).clip(CircleShape).background(HushColors.BrandLavender))
                    Text("AI-powered to-do · solo", color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp, fontFamily = Inter)
                }
            }

            Spacer(Modifier.height(28.dp))

            // Hero text
            Text(
                "Just say it.",
                color = Color.White,
                fontFamily = Inter,
                fontWeight = FontWeight.Black,
                fontSize = 56.sp,
                lineHeight = 56.sp,
                textAlign = TextAlign.Center,
            )
            Text(
                "I'll handle it.",
                color = Color.White,
                style = HushType.DisplayHugeItalic.copy(fontSize = 56.sp, lineHeight = 60.sp),
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(20.dp))

            Text(
                "A quietly powerful to-do with an AI agent that captures, drafts, researches and schedules — so you can get back to the one thing that matters.",
                color = Color.White.copy(alpha = 0.9f),
                fontFamily = Inter,
                fontSize = 14.sp,
                lineHeight = 20.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(max = 340.dp)
            )

            Spacer(Modifier.height(28.dp))

            Button(
                onClick = onEnter,
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = HushColors.Ink,
                    contentColor = Color.White,
                ),
                contentPadding = PaddingValues(horizontal = 22.dp, vertical = 14.dp)
            ) {
                Text("Enter the app", fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(14.dp))
            }

            Spacer(Modifier.height(14.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                listOf("Free, local-first", "No sign-in", "Dark & light").forEach {
                    Text(it, color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp, fontFamily = Inter)
                }
            }

            Spacer(Modifier.weight(1f))

            // Small app preview card
            AppPreviewCard()
        }
    }
}

@Composable
private fun AppPreviewCard() {
    GlassSurface(
        shape = RoundedCornerShape(22.dp),
        strong = true,
        modifier = Modifier.fillMaxWidth(0.95f).padding(bottom = 8.dp)
    ) {
        Column(Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .size(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(HushColors.Ink),
                    contentAlignment = Alignment.Center,
                ) { Text("h", color = Color.White, fontSize = 10.sp, fontFamily = FragmentMono) }
                Spacer(Modifier.width(6.dp))
                Text("Hush", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp, fontFamily = Inter)
                Spacer(Modifier.weight(1f))
                Text("09:41", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp, fontFamily = FragmentMono)
            }
            Spacer(Modifier.height(10.dp))
            // Quick-add stub
            Box(
                Modifier
                    .fillMaxWidth()
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.08f))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
            ) {
                Text("Just say what’s on your mind…", color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp, fontFamily = Inter)
            }
            Spacer(Modifier.height(10.dp))
            listOf(
                "Draft the quarterly review doc" to "Agent is on it",
                "Call mom" to null,
                "Book a Thai spot for Friday" to "Needs you",
            ).forEach { (title, state) ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.05f))
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(
                                if (state == "Needs you") HushColors.AgentGold.copy(alpha = 0.3f)
                                else Color.Transparent
                            )
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(title, color = Color.White.copy(alpha = 0.9f), fontSize = 12.sp, fontFamily = Inter, modifier = Modifier.weight(1f))
                    if (state != null) {
                        Text(state, color = HushColors.AgentGold, fontSize = 9.sp, fontFamily = FragmentMono)
                    }
                }
            }
        }
    }
}
