package com.hush.todo.ai

import com.hush.todo.core.DateParser
import com.hush.todo.data.Repo
import com.hush.todo.data.entities.MessageEntity
import com.hush.todo.data.entities.TaskEntity
import com.hush.todo.data.entities.TaskStates
import com.hush.todo.notify.scheduleForTask
import com.hush.todo.HushApp
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.UUID

class AgentStub(private val repo: Repo) {

    suspend fun chat(text: String) {
        val now = System.currentTimeMillis()
        repo.addMessage(MessageEntity(UUID.randomUUID().toString(), "user", text, now))
        val parsed = DateParser.parse(text)
        val tasks = repo.tasksSnapshot().filter { it.state != TaskStates.DONE }
        val reply = when (parsed.intent) {
            "query_week" -> weekSummary(tasks)
            "complete" -> {
                val q = (parsed.completeQuery ?: parsed.title).lowercase(Locale.getDefault())
                val hit = tasks.firstOrNull { it.title.lowercase(Locale.getDefault()).contains(q) }
                if (hit != null) {
                    repo.toggleDone(hit)
                    "Marked done: ${hit.title}"
                } else "I couldn't find “${parsed.completeQuery}”."
            }
            "add" -> {
                if (parsed.title.isNotBlank() && (parsed.dueMs != null || parsed.confidence >= 0.65f)) {
                    val t = parseCapture(text)
                    repo.addTask(t)
                    scheduleForTask(HushApp.instance, t)
                    "Saved: ${t.title}"
                } else localStatus(tasks)
            }
            else -> localStatus(tasks)
        }
        repo.addMessage(MessageEntity(UUID.randomUUID().toString(), "agent", reply, System.currentTimeMillis()))
    }

    suspend fun runOnTask(task: TaskEntity, kind: String) {
        val now = System.currentTimeMillis()
        if (kind == "plan") {
            val cal = Calendar.getInstance()
            cal.add(Calendar.DAY_OF_YEAR, 1)
            cal.set(Calendar.HOUR_OF_DAY, 9); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0)
            val next = task.copy(
                dueEpochMs = cal.timeInMillis,
                state = TaskStates.TODO,
                agentStatus = "done",
                agentLastMessage = "Scheduled tomorrow 9:00",
                agentOutput = "Due set to tomorrow 9:00. Reminders will fire before it.",
                updatedMs = now,
            )
            repo.updateTask(next)
            scheduleForTask(HushApp.instance, next)
            return
        }
        val output = "1. Confirm the due time for “${task.title}”.\n2. Gather what’s already done.\n3. Finish and submit."
        repo.updateTask(
            task.copy(
                notes = listOf(task.notes, output).filter { it.isNotBlank() }.joinToString("\n\n"),
                state = TaskStates.NEEDS_YOU,
                agentStatus = "needs_you",
                agentLastMessage = "Ready — check the notes.",
                agentOutput = output,
                updatedMs = now,
            )
        )
    }

    fun parseCapture(raw: String): TaskEntity {
        val parsed = DateParser.parse(raw)
        val now = System.currentTimeMillis()
        return TaskEntity(
            id = "t-" + UUID.randomUUID().toString().take(8),
            title = parsed.title.ifBlank { raw },
            dueEpochMs = parsed.dueMs,
            createdMs = now, updatedMs = now,
            source = "manual",
            confidence = parsed.confidence,
            needsReview = parsed.needsReview,
        )
    }

    private fun weekSummary(tasks: List<TaskEntity>): String {
        val start = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        val end = start + 7L * 24 * 60 * 60 * 1000
        val week = tasks.filter { val d = it.dueEpochMs ?: return@filter false; d >= start && d < end }
        if (week.isEmpty()) return "Nothing due this week."
        val fmt = SimpleDateFormat("EEE HH:mm", Locale.getDefault())
        return "${week.size} due this week:\n" + week.joinToString("\n") {
            "• ${it.title}" + (it.dueEpochMs?.let { ms -> " (${fmt.format(Date(ms))})" } ?: "")
        }
    }

    private fun localStatus(tasks: List<TaskEntity>): String {
        val start = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        val overdue = tasks.count { (it.dueEpochMs ?: Long.MAX_VALUE) < start }
        return "Open: ${tasks.size}. Overdue $overdue. Ask what’s due this week, or say a deadline to save it."
    }
}
