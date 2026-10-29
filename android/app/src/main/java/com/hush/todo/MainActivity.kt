package com.hush.todo

import android.content.Context.MODE_PRIVATE
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.hush.todo.ui.screens.HomeScreen
import com.hush.todo.ui.screens.LandingScreen
import com.hush.todo.ui.theme.HushTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            HushTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Transparent
                ) {
                    val prefs = remember { getSharedPreferences("hush", MODE_PRIVATE) }
                    var entered by remember { mutableStateOf(prefs.getBoolean("entered", false)) }
                    val repo = (application as HushApp).repo
                    val scope = rememberCoroutineScope()
                    if (!entered) {
                        LandingScreen(onEnter = {
                            prefs.edit().putBoolean("entered", true).apply()
                            entered = true
                        })
                    } else {
                        HomeScreen(repo = repo, scope = scope)
                    }
                }
            }
        }
    }
}
