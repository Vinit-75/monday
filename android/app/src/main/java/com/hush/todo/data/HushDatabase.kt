package com.hush.todo.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.hush.todo.data.entities.MessageEntity
import com.hush.todo.data.entities.ProjectEntity
import com.hush.todo.data.entities.TaskEntity

@Database(
    entities = [ProjectEntity::class, TaskEntity::class, MessageEntity::class],
    version = 1,
    exportSchema = false
)
abstract class HushDatabase : RoomDatabase() {
    abstract fun projects(): ProjectDao
    abstract fun tasks(): TaskDao
    abstract fun messages(): MessageDao

    companion object {
        @Volatile private var INSTANCE: HushDatabase? = null
        fun get(ctx: Context): HushDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    ctx.applicationContext,
                    HushDatabase::class.java,
                    "hush.db"
                ).fallbackToDestructiveMigration().build().also { INSTANCE = it }
            }
    }
}
