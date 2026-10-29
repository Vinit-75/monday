package com.hush.todo.ai

import com.hush.todo.data.Repo
import com.hush.todo.data.entities.MessageEntity
import com.hush.todo.data.entities.TaskEntity
import com.hush.todo.data.entities.TaskStates
import kotlinx.coroutines.delay
import java.util.UUID

/**
 * Stub agent — same shape the real OpenAI/Claude-backed one will implement
 * so the UI never needs to change when it's wired in.
 */
class AgentStub(private val repo: Repo) {

    private val canned = mapOf(
        "default" to listOf(
            "Here’s what I’m seeing: 4 for today, 2 overdue. Want me to re-prioritize?",
            "I can take that — researching now.",
            "Done. Dropped the draft into the task notes.",
        ),
        "plan" to listOf(
            "Blocked out 9–11am for the quarterly review, 2–3pm for Priya, 6pm for mom. Work?",
        ),
        "research" to listOf(
            "Pulled 3 options under a 15-minute walk. Dropped them in the task.",
        ),
        "draft" to listOf(
            "Draft is in the notes. Warm but direct. Say the word and I’ll send it.",
        ),
    )

    suspend fun chat(text: String) {
        val now = System.currentTimeMillis()
        repo.addMessage(MessageEntity(UUID.randomUUID().toString(), "user", text, now))
        delay(500)
        val bucket = when {
            text.contains("plan", ignoreCase = true) || text.contains("priori", ignoreCase = true) -> "plan"
            text.contains("find", ignoreCase = true) || text.contains("research", ignoreCase = true) -> "research"
            text.contains("draft", ignoreCase = true) || text.contains("write", ignoreCase = true) -> "draft"
            else -> "default"
        }
        val reply = canned[bucket]!!.random()
        repo.addMessage(MessageEntity(UUID.randomUUID().toString(), "agent", reply, System.currentTimeMillis()))
    }

    suspend fun runOnTask(task: TaskEntity, kind: String) {
        val startMs = System.currentTimeMillis()
        val working = task.copy(
            state = TaskStates.AGENT_WORKING,
            agentStatus = "working",
            agentLastMessage = when (kind) { "research" -> "Looking things up…"; "draft" -> "Drafting…"; else -> "Planning…" },
            agentOutput = null,
            agentStartedMs = startMs,
            updatedMs = startMs,
        )
        repo.updateTask(working)
        delay(2200)
        val outputs = mapOf(
            "research" to "Three options worth looking at — details in the notes.",
            "draft" to "Draft ready — short, warm, direct.",
            "plan" to "Scheduled for a 45-min block tomorrow morning.",
        )
        val done = working.copy(
            state = TaskStates.NEEDS_YOU,
            agentStatus = "needs_you",
            agentLastMessage = "Done — needs your approval.",
            agentOutput = outputs[kind],
            updatedMs = System.currentTimeMillis(),
        )
        repo.updateTask(done)
    }

    /** Naive natural-language task capture. */
    fun parseCapture(raw: String): TaskEntity {
        var text = raw.trim()
        var priority = 4
        var due: Long? = null

        Regex("""!p([1-4])""").find(text)?.let {
            priority = it.groupValues[1].toInt()
            text = text.replace(it.value, "").trim()
        }
        val lower = text.lowercase()
        val cal = java.util.Calendar.getInstance()
        when {
            Regex("""\btoday\b""").containsMatchIn(lower) -> {
                cal.set(java.util.Calendar.HOUR_OF_DAY, 17); cal.set(java.util.Calendar.MINUTE, 0)
                due = cal.timeInMillis; text = text.replace(Regex("""(?i)\btoday\b"""), "").trim()
            }
            Regex("""\btomorrow\b""").containsMatchIn(lower) -> {
                cal.add(java.util.Calendar.DAY_OF_YEAR, 1)
                cal.set(java.util.Calendar.HOUR_OF_DAY, 17); cal.set(java.util.Calendar.MINUTE, 0)
                due = cal.timeInMillis; text = text.replace(Regex("""(?i)\btomorrow\b"""), "").trim()
            }
        }
        val tags = Regex("""#(\w+)""").findAll(text).map { it.groupValues[1] }.toList()
        text = text.replace(Regex("""#\w+"""), "").trim()

        val now = System.currentTimeMillis()
        return TaskEntity(
            id = "t-" + UUID.randomUUID().toString().take(8),
            title = text.ifBlank { raw },
            priority = priority,
            dueEpochMs = due,
            tagsCsv = tags.joinToString(","),
            createdMs = now, updatedMs = now,
        )
    }
}
