package com.hush.todo.core

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer

class SpeechCapture(private val ctx: Context) : SpeechInput {
    private var rec: SpeechRecognizer? = null
    private var lastText = ""
    private var lastConf = 0f
    private var callback: ((String, Float) -> Unit)? = null

    override fun start(lang: String) {
        lastText = ""; lastConf = 0f
        rec?.destroy()
        rec = SpeechRecognizer.createSpeechRecognizer(ctx)
        rec?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onError(error: Int) { callback?.invoke(lastText, lastConf); callback = null }
            override fun onResults(results: Bundle) {
                val texts = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val confs = results.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES)
                lastText = texts?.firstOrNull().orEmpty()
                lastConf = confs?.firstOrNull() ?: 0f
                callback?.invoke(lastText, lastConf)
                callback = null
            }
            override fun onPartialResults(partialResults: Bundle) {
                lastText = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty()
            }
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })
        val locale = when (lang) {
            "hi" -> "hi-IN"
            "en" -> "en-IN"
            else -> "en-IN"
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        rec?.startListening(intent)
    }

    override fun stop(onResult: (transcript: String, confidence: Float) -> Unit) {
        callback = onResult
        rec?.stopListening()
    }

    override fun abort() {
        rec?.cancel()
        rec?.destroy()
        rec = null
        callback = null
    }
}
