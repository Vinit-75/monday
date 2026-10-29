package com.hush.todo.notify

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.hush.todo.HushApp
import com.hush.todo.MainActivity
import com.hush.todo.data.entities.TaskEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

const val CHANNEL_ID = "hush-deadlines"

fun ensureChannel(ctx: Context) {
    if (Build.VERSION.SDK_INT >= 26) {
        val mgr = ctx.getSystemService(NotificationManager::class.java)
        mgr.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Deadlines", NotificationManager.IMPORTANCE_HIGH)
        )
    }
}

fun reminderDelays(dueMs: Long, now: Long = System.currentTimeMillis()): List<Pair<String, Long>> {
    val offsets = listOf("3d" to 3L * 24 * 60 * 60 * 1000, "1d" to 24L * 60 * 60 * 1000, "3h" to 3L * 60 * 60 * 1000)
    return offsets.map { it.first to (dueMs - it.second) }.filter { it.second > now }.map { it.first to (it.second - now) }
}

fun scheduleForTask(ctx: Context, task: TaskEntity) {
    val wm = WorkManager.getInstance(ctx)
    listOf("3d", "1d", "3h").forEach { tag ->
        wm.cancelUniqueWork("rem-${task.id}-$tag")
    }
    val due = task.dueEpochMs ?: return
    if (task.state == "done") return
    reminderDelays(due).forEach { (tag, delay) ->
        val req = OneTimeWorkRequestBuilder<ReminderWorker>()
            .setInitialDelay(delay, TimeUnit.MILLISECONDS)
            .setInputData(workDataOf("taskId" to task.id, "title" to task.title, "tag" to tag))
            .build()
        wm.enqueueUniqueWork("rem-${task.id}-$tag", ExistingWorkPolicy.REPLACE, req)
    }
}

class ReminderWorker(ctx: Context, params: WorkerParameters) : Worker(ctx, params) {
    override fun doWork(): Result {
        ensureChannel(applicationContext)
        val title = inputData.getString("title") ?: return Result.success()
        val taskId = inputData.getString("taskId") ?: return Result.success()
        val done = PendingIntent.getBroadcast(
            applicationContext, taskId.hashCode(),
            Intent(applicationContext, ReminderActionReceiver::class.java).putExtra("action", "done").putExtra("taskId", taskId),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val snooze = PendingIntent.getBroadcast(
            applicationContext, taskId.hashCode() + 1,
            Intent(applicationContext, ReminderActionReceiver::class.java).putExtra("action", "snooze").putExtra("taskId", taskId),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val open = PendingIntent.getActivity(
            applicationContext, 0, Intent(applicationContext, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText("Deadline reminder")
            .setContentIntent(open)
            .addAction(0, "Done", done)
            .addAction(0, "Snooze", snooze)
            .setAutoCancel(true)
            .build()
        try {
            NotificationManagerCompat.from(applicationContext).notify(taskId.hashCode(), n)
        } catch (_: SecurityException) { }
        return Result.success()
    }
}

class ReminderActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra("taskId") ?: return
        val action = intent.getStringExtra("action")
        val app = context.applicationContext as HushApp
        CoroutineScope(Dispatchers.IO).launch {
            val t = app.repo.getTask(id) ?: return@launch
            val now = System.currentTimeMillis()
            when (action) {
                "done" -> app.repo.updateTask(t.copy(state = "done", completedMs = now, updatedMs = now))
                "snooze" -> {
                    val until = now + 60L * 60 * 1000
                    val next = t.copy(dueEpochMs = until, updatedMs = now)
                    app.repo.updateTask(next)
                    scheduleForTask(context, next)
                }
            }
        }
    }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val app = context.applicationContext as HushApp
        CoroutineScope(Dispatchers.IO).launch {
            app.repo.tasksSnapshot().forEach { scheduleForTask(context, it) }
        }
    }
}
