package com.hush.todo.data

import com.hush.todo.data.entities.ProjectEntity

suspend fun seedIfEmpty(repo: Repo) {
    if (repo.hasProjects()) return
    repo.bulkSeedProjects(
        listOf(
            ProjectEntity("p-personal", "Personal", "🌱", 0xFFAED98C, false, 0),
            ProjectEntity("p-work", "Work", "💼", 0xFF9191FF, false, 1),
            ProjectEntity("p-home", "Home", "🏡", 0xFFFFD8A8, false, 2),
            ProjectEntity("p-uni", "University", "🎓", 0xFF79BFFF, false, 3),
        )
    )
}

suspend fun purgeDemoTasks(repo: Repo) {
    listOf(
        "seed-welcome", "seed-qreview", "seed-mom", "seed-thai", "seed-bulb",
        "seed-priya", "seed-lindy", "seed-hike", "seed-audit", "seed-plants",
    ).forEach { repo.deleteTask(it) }
}
