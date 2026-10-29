package com.hush.todo.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hush.todo.ui.components.GlassSurface
import com.hush.todo.ui.theme.HushColors
import com.hush.todo.ui.theme.Inter

@Composable
fun QuickCaptureBar(
    modifier: Modifier = Modifier,
    onSubmit: (String) -> Unit,
) {
    var text by remember { mutableStateOf("") }

    GlassSurface(shape = RoundedCornerShape(26.dp), strong = true, modifier = modifier.fillMaxWidth()) {
        Row(
            Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.weight(1f).padding(horizontal = 10.dp)) {
                if (text.isEmpty()) {
                    androidx.compose.material3.Text(
                        "Type a task — try 'call mom tomorrow !p2'",
                        color = Color.White.copy(alpha = 0.45f),
                        fontSize = 13.sp,
                        fontFamily = Inter,
                    )
                }
                BasicTextField(
                    value = text,
                    onValueChange = { text = it },
                    singleLine = true,
                    textStyle = TextStyle(color = Color.White, fontSize = 13.sp, fontFamily = Inter),
                    cursorBrush = SolidColor(HushColors.BrandLavender),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            IconButton(
                onClick = {
                    if (text.isNotBlank()) {
                        onSubmit(text.trim())
                        text = ""
                    }
                },
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(50))
                    .background(if (text.isBlank()) Color.White.copy(alpha = 0.08f) else HushColors.BrandPrimary),
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.Send,
                    contentDescription = "Add",
                    tint = Color.White,
                    modifier = Modifier.size(14.dp),
                )
            }
        }
    }
}
