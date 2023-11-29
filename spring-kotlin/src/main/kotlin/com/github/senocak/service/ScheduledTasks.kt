package com.github.senocak.service

import com.github.senocak.domain.dto.WebsocketIdentifier
import org.apache.commons.lang3.exception.ExceptionUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.socket.PingMessage
import java.text.DecimalFormat
import java.text.SimpleDateFormat
import java.util.Date

@Component
@EnableScheduling
class ScheduledTasks(private val webSocketCacheService: WebSocketCacheService){
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)
    private val dateFormat = SimpleDateFormat("HH:mm:ss")
    private val byte = 1L
    private val kb: Long = byte * 1000
    private val mb = kb * 1000
    private val gb = mb * 1000
    private val tb = gb * 1000

    /**
     * this is scheduled to run every in 10_000 milliseconds period // every 10 seconds
     */
    @Scheduled(fixedRate = 10_000)
    fun pingWs() {
        val allWebSocketSession: Map<String, WebsocketIdentifier> = webSocketCacheService.allWebSocketSession
        if (allWebSocketSession.isNotEmpty())
            for (entry in allWebSocketSession) {
                try {
                    entry.value.session!!.sendMessage(PingMessage())
                    log.debug("Pinged user with key: ${entry.key}, and session: ${entry.value}")
                } catch (e: Exception) {
                    log.error("Exception occurred for sending ping message: ${ExceptionUtils.getMessage(e)}")
                    webSocketCacheService.deleteSession(key = entry.key)
                }
            }
    }

    /**
     * this is scheduled to run every minute
     */
    @Scheduled(cron = "0 * * ? * *")
    fun checkPostsCreated(): Runtime =
            Runtime.getRuntime()
                .also {
                    log.info("The time executed: ${dateFormat.format(Date())}, " +
                            "availableProcessors: ${it.availableProcessors()}, " +
                            "totalMemory: ${toHumanReadableSIPrefixes(it.totalMemory())}, " +
                            "maxMemory: ${toHumanReadableSIPrefixes(it.maxMemory())}, " +
                            "freeMemory: ${toHumanReadableSIPrefixes(it.freeMemory())}")
                }

    private fun toHumanReadableSIPrefixes(size: Long): String {
        require(value = size >= 0) { "Invalid file size: $size" }
        return when {
            size >= tb -> formatSize(size = size, divider = tb, unitName = "TB")
            size >= gb -> formatSize(size = size, divider = gb, unitName = "GB")
            size >= mb -> formatSize(size = size, divider = mb, unitName = "MB")
            size >= kb -> formatSize(size = size, divider = kb, unitName = "KB")
            else -> formatSize(size = size, divider = byte, unitName = "Bytes")
        }
    }

    private fun formatSize(size: Long, divider: Long, unitName: String): String =
        DecimalFormat("#.##").format(size.toDouble() / divider) + " " + unitName
}