package com.hush.todo.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hush.todo.ai.AgentStub
import com.hush.todo.core.DateParser
import com.hush.todo.core.ParseResult
import com.hush.todo.core.SecureSettings
import com.hush.todo.core.SpeechCapture
import com.hush.todo.data.Repo
import com.hush.todo.notify.scheduleForTask
import com.hush.todo.data.entities.TaskStates
import com.hush.todo.ui.components.AgentRing
import com.hush.todo.ui.components.GlassSurface
import com.hush.todo.ui.components.StillAgentBorder
import com.hush.todo.ui.components.Wallpaper
import com.hush.todo.ui.theme.FragmentMono
import com.hush.todo.ui.theme.HushColors
import com.hush.todo.ui.theme.HushType
import com.hush.todo.ui.theme.Inter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class Tab { Today, Inbox, Upcoming }

@Composable
fun HomeScreen(repo: Repo, scope: CoroutineScope) {
    val context = LocalContext.current
    val tasks by repo.tasks().collectAsState(initial = emptyList())
    val projects by repo.projects().collectAsState(initial = emptyList())
    val messages by repo.messages().collectAsState(initial = emptyList())

    var tab by remember { mutableStateOf(Tab.Today) }
    var drawerOpen by remember { mutableStateOf(false) }
    var agentOpen by remember { mutableStateOf(false) }
    var listening by remember { mutableStateOf(false) }
    var settingsOpen by remember { mutableStateOf(false) }
    var pending by remember { mutableStateOf<ParseResult?>(null) }
    var notice by remember { mutableStateOf<String?>(null) }
    val settings = remember { SecureSettings(context) }
    val speech = remember { SpeechCapture(context) }

    val agent = remember { AgentStub(repo) }

    val filtered = remember(tasks, tab) {
        val now = System.currentTimeMillis()
        val startOfTomorrow = run {
            val c = java.util.Calendar.getInstance(); c.timeInMillis = now
            c.set(java.util.Calendar.HOUR_OF_DAY, 0); c.set(java.util.Calendar.MINUTE, 0)
            c.set(java.util.Calendar.SECOND, 0); c.set(java.util.Calendar.MILLISECOND, 0)
            c.add(java.util.Calendar.DAY_OF_YEAR, 1); c.timeInMillis
        }
        when (tab) {
            Tab.Today -> tasks.filter { it.state != TaskStates.DONE && it.dueEpochMs != null }
            Tab.Inbox -> tasks.filter { it.state != TaskStates.DONE && it.projectId == null }
            Tab.Upcoming -> tasks.filter { it.state != TaskStates.DONE && it.dueEpochMs != null && it.dueEpochMs >= startOfTomorrow }
        }.sortedWith(compareBy({ it.priority }, { it.dueEpochMs ?: Long.MAX_VALUE }))
    }

    Box(Modifier.fillMaxSize()) {
        Wallpaper()

        Column(Modifier.fillMaxSize()) {
            // Top bar
            Row(
                Modifier.fillMaxWidth().padding(top = 48.dp, start = 16.dp, end = 16.dp, bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                GlassSurface(shape = CircleShape, strong = true) {
                    IconButton(onClick = { drawerOpen = true }) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.White)
                    }
                }
                Spacer(Modifier.weight(1f))
                Text(
                    SimpleDateFormat("EEE, MMM d", Locale.getDefault()).format(Date()),
                    color = Color.White.copy(alpha = 0.75f),
                    fontFamily = FragmentMono,
                    fontSize = 11.sp
                )
                Spacer(Modifier.weight(1f))
                Spacer(Modifier.size(48.dp))
            }

            // Title block
            Column(Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                when (tab) {
                    Tab.Today -> {
                        Text("Today", style = HushType.DisplayLarge, color = Color.White)
                    }
                    Tab.Inbox -> {
                        Text("Inbox", style = HushType.DisplayLargeItalic, color = Color.White)
                    }
                    Tab.Upcoming -> {
                        Row {
                            Text("Up", style = HushType.DisplayLarge, color = Color.White)
                            Text("coming", style = HushType.DisplayLargeItalic, color = Color.White)
                        }
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    when (tab) {
                        Tab.Today -> SimpleDateFormat("EEEE, MMMM d", Locale.getDefault()).format(Date())
                        Tab.Inbox -> "Unsorted captures"
                        Tab.Upcoming -> "The next seven days"
                    },
                    color = Color.White.copy(alpha = 0.6f), fontSize = 11.sp, fontFamily = FragmentMono,
                )
            }

            // Quick capture bar
            notice?.let {
                Text(it, color = Color.White.copy(0.8f), fontSize = 12.sp, modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp), fontFamily = Inter)
            }

            QuickCaptureBar(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                onSubmit = { text ->
                    scope.launch {
                        val t = agent.parseCapture(text)
                        repo.addTask(t)
                        scheduleForTask(context, t)
                    }
                },
            )

            // Task list
            LazyColumn(
                Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (filtered.isEmpty()) {
                    item {
                        Column(
                            Modifier.fillMaxWidth().padding(top = 72.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Text("All quiet.", style = HushType.DisplayMedium, color = Color.White.copy(alpha = 0.65f))
                            Text("Add one thing.", style = HushType.DisplayMediumItalic, color = Color.White)
                            Spacer(Modifier.height(8.dp))
                            Text("Tap the mic and talk, or type above.", color = Color.White.copy(alpha = 0.55f), fontSize = 12.sp, fontFamily = Inter)
                        }
                    }
                } else if (tab == Tab.Today) {
                    val start = run {
                        val c = java.util.Calendar.getInstance()
                        c.set(java.util.Calendar.HOUR_OF_DAY, 0); c.set(java.util.Calendar.MINUTE, 0)
                        c.set(java.util.Calendar.SECOND, 0); c.set(java.util.Calendar.MILLISECOND, 0)
                        c.timeInMillis
                    }
                    val weekEnd = start + 7L * 24 * 60 * 60 * 1000
                    val overdue = filtered.filter { it.dueEpochMs != null && it.dueEpochMs!! < start }
                    val week = filtered.filter { val d = it.dueEpochMs ?: return@filter false; d >= start && d < weekEnd }
                    val later = filtered.filter { (it.dueEpochMs ?: 0) >= weekEnd }
                    listOf("Overdue" to overdue, "Due this week" to week, "Upcoming" to later).forEach { (label, list) ->
                        item {
                            Text(label, color = Color.White.copy(0.45f), fontSize = 10.sp, fontFamily = FragmentMono, modifier = Modifier.padding(top = 8.dp, bottom = 4.dp))
                        }
                        items(list, key = { it.id }) { task ->
                            val project = projects.firstOrNull { it.id == task.projectId }
                            TaskRow(
                                task = task,
                                projectName = project?.name,
                                projectEmoji = project?.emoji,
                                onToggle = { scope.launch { repo.toggleDone(task) } },
                                onSnooze = { scope.launch { repo.snooze(task.id, System.currentTimeMillis() + 60L * 60 * 1000) } },
                                onDelete = { scope.launch { repo.deleteTask(task.id) } },
                                onAgentAction = { kind -> scope.launch { agent.runOnTask(task, kind) } },
                                onApprove = { scope.launch { repo.updateTask(task.copy(state = TaskStates.TODO, agentStatus = null, agentOutput = null, agentLastMessage = null, updatedMs = System.currentTimeMillis())) } },
                            )
                        }
                    }
                } else {
                    items(filtered, key = { it.id }) { task ->
                        val project = projects.firstOrNull { it.id == task.projectId }
                        TaskRow(
                            task = task,
                            projectName = project?.name,
                            projectEmoji = project?.emoji,
                            onToggle = { scope.launch { repo.toggleDone(task) } },
                            onSnooze = { scope.launch { repo.snooze(task.id, System.currentTimeMillis() + 60L * 60 * 1000) } },
                            onDelete = { scope.launch { repo.deleteTask(task.id) } },
                            onAgentAction = { kind -> scope.launch { agent.runOnTask(task, kind) } },
                            onApprove = { scope.launch { repo.updateTask(task.copy(state = TaskStates.TODO, agentStatus = null, agentOutput = null, agentLastMessage = null, updatedMs = System.currentTimeMillis())) } },
                        )
                    }
                }
                item { Spacer(Modifier.height(96.dp)) }
            }
        }

        // Bottom nav with raised mic FAB
        BottomNav(
            modifier = Modifier.align(Alignment.BottomCenter),
            activeTab = tab,
            agentOpen = agentOpen,
            listening = listening,
            onTab = { tab = it; agentOpen = false },
            onAgent = { agentOpen = !agentOpen },
            onMic = {
                if (listening) {
                    speech.stop { text, conf ->
                        listening = false
                        val parsed = DateParser.parse(text)
                        when (parsed.intent) {
                            "query_week" -> {
                                val n = filtered.size
                                notice = "$n due in this list"
                            }
                            "complete" -> {
                                val hit = tasks.firstOrNull { it.state != TaskStates.DONE && it.title.contains(parsed.completeQuery ?: "", true) }
                                if (hit != null) scope.launch { repo.toggleDone(hit) }
                                notice = if (hit != null) "Marked done: ${hit.title}" else "Not found"
                            }
                            else -> pending = parsed.copy(confidence = if (conf < 0.55f) 0.4f else parsed.confidence)
                        }
                    }
                } else {
                    listening = true
                    speech.start(settings.language)
                }
            },
        )

        AnimatedVisibility(visible = drawerOpen, enter = slideInVertically { -it }, exit = slideOutVertically { -it }) {
            NavDrawer(
                projects = projects,
                onProject = { },
                onSettings = { drawerOpen = false; settingsOpen = true },
                onDismiss = { drawerOpen = false },
            )
        }

        AnimatedVisibility(
            visible = agentOpen,
            enter = slideInVertically(initialOffsetY = { it }),
            exit = slideOutVertically(targetOffsetY = { it }),
        ) {
            AgentSheet(
                messages = messages,
                onSend = { text -> scope.launch { agent.chat(text) } },
                onClose = { agentOpen = false },
            )
        }

        pending?.let { p ->
            ConfirmSheet(
                pending = p,
                onSave = {
                    scope.launch {
                        val t = agent.parseCapture(p.title)
                        val saved = t.copy(
                            title = p.title.ifBlank { t.title },
                            dueEpochMs = p.dueMs ?: t.dueEpochMs,
                            source = "voice",
                            confidence = p.confidence,
                            needsReview = p.needsReview,
                        )
                        repo.addTask(saved)
                        scheduleForTask(context, saved)
                        pending = null
                    }
                },
                onDismiss = { pending = null },
            )
        }

        if (settingsOpen) {
            SettingsScreen(settings = settings, onClose = { settingsOpen = false })
        }
    }
}

@Composable
private fun ConfirmSheet(pending: ParseResult, onSave: () -> Unit, onDismiss: () -> Unit) {
    Box(Modifier.fillMaxSize().background(Color(0x99000000)), contentAlignment = Alignment.Center) {
        GlassSurface(shape = RoundedCornerShape(20.dp), strong = true, modifier = Modifier.padding(24.dp).fillMaxWidth()) {
            Column(Modifier.padding(20.dp)) {
                Text("Confirm before saving", color = Color.White.copy(0.5f), fontSize = 10.sp, fontFamily = FragmentMono)
                if (pending.needsReview) Text("needs review", color = HushColors.AgentGold, fontSize = 11.sp, fontFamily = Inter)
                Spacer(Modifier.height(8.dp))
                Text(pending.title.ifBlank { "Untitled" }, color = Color.White, style = HushType.DisplayMedium)
                pending.dueMs?.let {
                    Text(SimpleDateFormat("EEE d MMM, HH:mm", Locale.getDefault()).format(Date(it)), color = Color.White.copy(0.7f), fontSize = 12.sp, fontFamily = FragmentMono)
                }
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onSave) { Text("Save") }
                    TextButton(onClick = onDismiss) { Text("Dismiss", color = Color.White) }
                }
            }
        }
    }
}

@Composable
private fun BottomNav(
    modifier: Modifier,
    activeTab: Tab,
    agentOpen: Boolean,
    listening: Boolean,
    onTab: (Tab) -> Unit,
    onAgent: () -> Unit,
    onMic: () -> Unit,
) {
    Box(modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 20.dp), contentAlignment = Alignment.BottomCenter) {
        GlassSurface(shape = CircleShape, strong = true) {
            Row(
                Modifier.padding(horizontal = 10.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(2.dp),
            ) {
                NavItem(Icons.Default.Star, "Today", active = !agentOpen && activeTab == Tab.Today) { onTab(Tab.Today) }
                NavItem(Icons.Default.Inbox, "Inbox", active = !agentOpen && activeTab == Tab.Inbox) { onTab(Tab.Inbox) }
                // Raised mic
                Box(Modifier.width(72.dp).height(60.dp), contentAlignment = Alignment.Center) {
                    Box(
                        Modifier
                            .offset(y = (-20).dp)
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(if (listening) HushColors.AgentGold else HushColors.Ink),
                        contentAlignment = Alignment.Center,
                    ) {
                        if (listening) AgentRing(cornerRadius = 30.dp, modifier = Modifier.matchParentSize())
                        IconButton(onClick = onMic, modifier = Modifier.matchParentSize()) {
                            Icon(Icons.Default.Mic, contentDescription = "Talk", tint = if (listening) HushColors.Ink else Color.White, modifier = Modifier.size(22.dp))
                        }
                    }
                }
                NavItem(Icons.Default.CalendarMonth, "Upcoming", active = !agentOpen && activeTab == Tab.Upcoming) { onTab(Tab.Upcoming) }
                NavItem(Icons.Default.Message, "Agent", active = agentOpen) { onAgent() }
            }
        }
    }
}

@Composable
private fun NavItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, active: Boolean, onClick: () -> Unit) {
    Column(
        Modifier.widthIn(min = 56.dp).padding(horizontal = 4.dp).clip(RoundedCornerShape(12.dp)),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        IconButton(onClick = onClick) {
            Icon(icon, contentDescription = label, tint = if (active) Color.White else Color.White.copy(alpha = 0.4f), modifier = Modifier.size(18.dp))
        }
        Text(label, fontSize = 9.sp, color = if (active) Color.White else Color.White.copy(alpha = 0.4f), fontFamily = Inter, fontWeight = FontWeight.Medium)
    }
}
