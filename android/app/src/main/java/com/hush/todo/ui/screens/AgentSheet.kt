package com.hush.todo.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hush.todo.data.entities.MessageEntity
import com.hush.todo.ui.components.GlassSurface
import com.hush.todo.ui.theme.FragmentMono
import com.hush.todo.ui.theme.HushColors
import com.hush.todo.ui.theme.Inter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AgentSheet(
    messages: List<MessageEntity>,
    onSend: (String) -> Unit,
    onClose: () -> Unit,
) {
    var input by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    Box(Modifier.fillMaxSize().background(Color(0x66000000))) {
        // Tap scrim to dismiss
        Box(Modifier.fillMaxSize().clip(RoundedCornerShape(0.dp)).background(Color.Transparent)) {}

        Column(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .fillMaxHeight(0.82f)
                .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                .background(Color(0xF20D0D0D))
                .padding(top = 12.dp),
        ) {
            // Grabber + header
            Box(
                Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(width = 44.dp, height = 4.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.25f))
            )
            Spacer(Modifier.height(14.dp))
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier.size(28.dp).clip(CircleShape).background(HushColors.AgentGold.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center,
                ) { Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = HushColors.AgentGold, modifier = Modifier.size(14.dp)) }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text("Agent", color = Color.White, fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                    Text("1-to-1 · stubbed demo", color = Color.White.copy(alpha = 0.5f), fontSize = 10.sp, fontFamily = FragmentMono)
                }
                IconButton(onClick = onClose) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(Modifier.height(6.dp))

            // Messages
            LazyColumn(
                Modifier.weight(1f).fillMaxWidth(),
                state = listState,
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(messages, key = { it.id }) { msg ->
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = if (msg.role == "user") Arrangement.End else Arrangement.Start,
                    ) {
                        Box(
                            Modifier
                                .widthIn(max = 280.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(
                                    if (msg.role == "user") HushColors.BrandPrimary.copy(alpha = 0.85f)
                                    else Color.White.copy(alpha = 0.08f)
                                )
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                        ) {
                            Column {
                                Text(msg.text, color = Color.White, fontFamily = Inter, fontSize = 13.sp, lineHeight = 18.sp)
                                Text(
                                    SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date(msg.createdMs)),
                                    color = Color.White.copy(alpha = 0.5f),
                                    fontFamily = FragmentMono,
                                    fontSize = 9.sp,
                                    modifier = Modifier.padding(top = 2.dp),
                                )
                            }
                        }
                    }
                }
            }

            // Suggestions (shown while short)
            if (messages.size < 3) {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    listOf("Plan my day", "What should I do first?", "Draft the reply").forEach { s ->
                        Box(
                            Modifier
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.07f))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                        ) {
                            Text(s, color = Color.White.copy(alpha = 0.75f), fontSize = 11.sp, fontFamily = Inter)
                        }
                    }
                }
            }

            // Composer
            GlassSurface(
                shape = CircleShape, strong = true,
                modifier = Modifier.fillMaxWidth().padding(16.dp),
            ) {
                Row(
                    Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(Modifier.weight(1f).padding(horizontal = 10.dp)) {
                        if (input.isEmpty()) {
                            Text("Ask, or just say it…", color = Color.White.copy(alpha = 0.45f), fontSize = 13.sp, fontFamily = Inter)
                        }
                        BasicTextField(
                            value = input,
                            onValueChange = { input = it },
                            singleLine = true,
                            textStyle = TextStyle(color = Color.White, fontSize = 13.sp, fontFamily = Inter),
                            cursorBrush = SolidColor(HushColors.BrandLavender),
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                    IconButton(
                        onClick = { if (input.isNotBlank()) { onSend(input.trim()); input = "" } },
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(if (input.isBlank()) Color.White.copy(alpha = 0.08f) else HushColors.BrandPrimary),
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(14.dp))
                    }
                }
            }
        }
    }
}
