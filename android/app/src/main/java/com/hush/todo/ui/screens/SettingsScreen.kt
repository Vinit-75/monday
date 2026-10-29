package com.hush.todo.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hush.todo.core.SecureSettings
import com.hush.todo.ui.theme.Inter

@Composable
fun SettingsScreen(settings: SecureSettings, onClose: () -> Unit) {
    var lang by remember { mutableStateOf(settings.language) }
    var domain by remember { mutableStateOf(settings.senderDomain) }
    var groq by remember { mutableStateOf(if (settings.groqKey.isBlank()) "" else "••••••••") }
    var gemini by remember { mutableStateOf(if (settings.geminiKey.isBlank()) "" else "••••••••") }

    Column(
        Modifier.fillMaxSize().background(Color(0xF20D0D0D)).padding(20.dp)
    ) {
        Text("Settings", color = Color.White, fontSize = 28.sp, fontFamily = Inter)
        Text("Keys stay in encrypted storage. Never in the APK.", color = Color.White.copy(0.55f), fontSize = 12.sp, fontFamily = Inter)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(lang, { lang = it }, label = { Text("Language: auto / en / hi") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(domain, { domain = it }, label = { Text("University sender domain") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(groq, { groq = it }, label = { Text("Groq API key") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(gemini, { gemini = it }, label = { Text("Gemini API key") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = {
                settings.language = lang.trim().ifBlank { "auto" }
                settings.senderDomain = domain.trim()
                if (!groq.startsWith("•")) settings.groqKey = groq.trim()
                if (!gemini.startsWith("•")) settings.geminiKey = gemini.trim()
                onClose()
            },
            shape = RoundedCornerShape(24.dp),
        ) { Text("Save") }
        TextButton(onClick = onClose) { Text("Close", color = Color.White) }
    }
}
