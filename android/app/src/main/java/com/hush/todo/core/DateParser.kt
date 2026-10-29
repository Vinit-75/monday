package com.hush.todo.core

import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

data class ParseResult(
    val intent: String,
    val title: String,
    val dueMs: Long?,
    val confidence: Float,
    val needsReview: Boolean,
    val completeQuery: String? = null,
    val raw: String,
)

object DateParser {
    fun parse(raw: String, nowMs: Long = System.currentTimeMillis(), tz: TimeZone = TimeZone.getDefault()): ParseResult {
        val original = raw.trim()
        if (original.isEmpty()) return ParseResult("unknown", "", null, 0f, true, raw = original)
        val lower = original.lowercase(Locale.getDefault())
        if (Regex("what'?s due (this )?week|due this week|इस हफ्ते|is+ hafte|iss hafte").containsMatchIn(lower) || original.contains("इस हफ्ते")) {
            return ParseResult("query_week", "", null, 0.95f, false, raw = original)
        }
        if (Regex("^(mark|complete|finish|done with)\\b").containsMatchIn(lower) ||
            lower.contains("ho gaya") || original.contains("कर दिया") || original.contains("हो गया")
        ) {
            val q = original
                .replace(Regex("^(mark|complete|finish|done with)\\s+", RegexOption.IGNORE_CASE), "")
                .replace(Regex("\\s+(as\\s+)?(done|complete|finished)$", RegexOption.IGNORE_CASE), "")
                .replace(Regex("\\s+ho gya?$", RegexOption.IGNORE_CASE), "")
                .trim()
            return ParseResult("complete", q, null, 0.85f, q.length <= 1, q, original)
        }

        var text = original
        var due: Calendar? = null
        var dateScore = 0f
        var hadTime = false

        fun cal(): Calendar = Calendar.getInstance(tz).apply { timeInMillis = nowMs }

        Regex("\\b(today|aaj|आज)\\b", RegexOption.IGNORE_CASE).find(text)?.let {
            due = cal().also { c -> c.set(Calendar.HOUR_OF_DAY, 17); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0) }
            dateScore = 0.95f
            text = text.replace(it.value, " ")
        } ?: Regex("\\b(day after tomorrow|parso|parson|परसों)\\b", RegexOption.IGNORE_CASE).find(text)?.let {
            due = cal().also { c -> c.add(Calendar.DAY_OF_YEAR, 2); c.set(Calendar.HOUR_OF_DAY, 17); c.set(Calendar.MINUTE, 0) }
            dateScore = 0.9f
            text = text.replace(it.value, " ")
        } ?: Regex("\\b(tomorrow|kal|कल)\\b", RegexOption.IGNORE_CASE).find(text)?.let {
            due = cal().also { c -> c.add(Calendar.DAY_OF_YEAR, 1); c.set(Calendar.HOUR_OF_DAY, 17); c.set(Calendar.MINUTE, 0) }
            dateScore = 0.85f
            text = text.replace(it.value, " ")
        }

        val days = listOf("sunday","monday","tuesday","wednesday","thursday","friday","saturday")
        if (due == null) {
            for ((i, name) in days.withIndex()) {
                if (Regex("\\b$name\\b", RegexOption.IGNORE_CASE).containsMatchIn(text) ||
                    Regex("\\b${name.take(3)}\\b", RegexOption.IGNORE_CASE).containsMatchIn(text)
                ) {
                    val c = cal()
                    val target = i + 1 // Calendar.SUNDAY = 1
                    val add = (target - c.get(Calendar.DAY_OF_WEEK) + 7) % 7
                    c.add(Calendar.DAY_OF_YEAR, add)
                    c.set(Calendar.HOUR_OF_DAY, 17); c.set(Calendar.MINUTE, 0)
                    due = c
                    dateScore = 0.85f
                    text = text.replace(Regex("(?i)\\b$name\\b"), " ")
                    break
                }
            }
        }

        Regex("\\b(11\\s*:\\s*59)\\s*(pm)?\\b", RegexOption.IGNORE_CASE).find(text)?.let {
            hadTime = true
            val c = due ?: cal()
            c.set(Calendar.HOUR_OF_DAY, 23); c.set(Calendar.MINUTE, 59)
            due = c
            text = text.replace(it.value, " ")
        } ?: Regex("\\b(\\d{1,2})(?::(\\d{2}))?\\s*(a\\.?m\\.?|p\\.?m\\.?|baje|बजे)?\\b", RegexOption.IGNORE_CASE).find(text)?.let { m ->
            val around = text.lowercase(Locale.getDefault())
            var h = m.groupValues[1].toInt()
            val min = m.groupValues[2].ifBlank { "0" }.toInt()
            val ap = m.groupValues[3].lowercase(Locale.getDefault()).replace(".", "")
            if (ap == "pm" && h < 12) h += 12
            if (ap == "am" && h == 12) h = 0
            if ((around.contains("shaam") || around.contains("शाम") || around.contains("raat") || around.contains("रात")) && h <= 12 && h != 0) {
                if (h < 12) h += 12
            }
            if (h in 0..23 && min in 0..59 && (ap.isNotBlank() || m.groupValues[2].isNotBlank() || around.contains("baje") || around.contains("बजे"))) {
                hadTime = true
                val c = due ?: cal()
                c.set(Calendar.HOUR_OF_DAY, h); c.set(Calendar.MINUTE, min); c.set(Calendar.SECOND, 0)
                due = c
                text = text.replace(m.value, " ")
            }
        }

        if (due != null && !hadTime) {
            val academic = Regex("assign|submit|deadline|due|exam|quiz", RegexOption.IGNORE_CASE).containsMatchIn(original)
            due!!.set(Calendar.HOUR_OF_DAY, if (academic) 23 else 17)
            due!!.set(Calendar.MINUTE, if (academic) 59 else 0)
        }

        val title = text.replace(Regex("\\btak\\b|तक|remind me to|add a task", RegexOption.IGNORE_CASE), " ")
            .replace(Regex("\\s+"), " ").trim().ifBlank { original }
        val conf = when {
            due != null -> (0.55f + dateScore * 0.4f).coerceAtMost(0.99f)
            else -> 0.45f
        }
        return ParseResult("add", title, due?.timeInMillis, conf, conf < 0.65f, raw = original)
    }
}
