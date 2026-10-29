package com.hush.todo.data

import com.hush.todo.data.entities.MessageEntity
import com.hush.todo.data.entities.ProjectEntity
import com.hush.todo.data.entities.TaskEntity
import com.hush.todo.data.entities.TaskStates
import java.util.Calendar

suspend fun seedIfEmpty(repo: Repo) {
    if (repo.hasProjects()) return
    val now = System.currentTimeMillis()
    val projects = listOf(
        ProjectEntity("p-personal", "Personal", "🌱", 0xFFAED98C, false, 0),
        ProjectEntity("p-work", "Work", "💼", 0xFF9191FF, false, 1),
        ProjectEntity("p-home", "Home", "🏡", 0xFFFFD8A8, false, 2),
        ProjectEntity("p-ideas", "Ideas", "✨", 0xFF79BFFF, false, 3),
    )
    repo.bulkSeedProjects(projects)

    val tasks = listOf(
        seed("seed-welcome", "Welcome to Hush — tap the mic to talk to your agent", null, 2, inDays(0)),
        seed("seed-qreview", "Draft the quarterly review doc", "p-work", 1, inDays(0),
            state = TaskStates.AGENT_WORKING,
            agentStatus = "working", agentLast = "Reading last quarter’s notes…"),
        seed("seed-mom", "Call mom", "p-personal", 2, inDays(0)),
        seed("seed-thai", "Book a Thai spot for Friday — somewhere quiet", "p-personal", 3, inDays(2),
            state = TaskStates.NEEDS_YOU,
            agentStatus = "needs_you",
            agentLast = "Picked 3 options under a 15-min walk. Which one?",
            agentOut = "Soi 38 · Pok Pok · Night + Market — all within a 15-min walk. Soi 38 is quietest."),
        seed("seed-bulb", "Replace the kitchen bulb", "p-home", 4, inDays(1)),
        seed("seed-priya", "Reply to Priya about Thursday", "p-work", 2, inDays(1)),
        seed("seed-lindy", "Read the Lindy paper and summarize", "p-ideas", 3, inDays(4)),
        seed("seed-hike", "Plan weekend hike route", "p-personal", 3, inDays(3)),
        seed("seed-audit", "Audit the landing page copy", "p-work", 2, inDays(2)),
        seed("seed-plants", "Water the plants", "p-home", 4, inDays(0)),
    )
    repo.bulkSeedTasks(tasks)

    repo.bulkSeedMessages(listOf(
        MessageEntity(
            id = "seed-agent-welcome",
            role = "agent",
            text = "I’m here when you need me. Tap the mic and tell me what’s on your plate — I’ll take anything I can.",
            createdMs = now,
        )
    ))
}

private fun inDays(n: Int): Long {
    val cal = Calendar.getInstance()
    cal.add(Calendar.DAY_OF_YEAR, n)
    cal.set(Calendar.HOUR_OF_DAY, 17); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
    return cal.timeInMillis
}

private fun seed(
    id: String, title: String, projectId: String?, priority: Int, due: Long,
    state: String = TaskStates.TODO,
    agentStatus: String? = null, agentLast: String? = null, agentOut: String? = null,
): TaskEntity {
    val now = System.currentTimeMillis()
    return TaskEntity(
        id = id, title = title, projectId = projectId, priority = priority,
        dueEpochMs = due, state = state,
        agentStatus = agentStatus, agentLastMessage = agentLast, agentOutput = agentOut,
        agentStartedMs = if (agentStatus != null) now else null,
        createdMs = now, updatedMs = now,
    )
}
