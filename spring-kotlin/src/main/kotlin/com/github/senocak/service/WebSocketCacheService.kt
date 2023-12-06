package com.github.senocak.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.github.senocak.domain.dto.WebsocketIdentifier
import com.github.senocak.domain.dto.WsRequestBody
import com.github.senocak.util.WsType
import org.apache.commons.lang3.exception.ExceptionUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.socket.TextMessage
import java.io.IOException
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Service
class WebSocketCacheService(private val objectMapper: ObjectMapper) {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)
    private val userSessionCache: MutableMap<String, WebsocketIdentifier> = ConcurrentHashMap<String, WebsocketIdentifier>()

    /**
     * Get all websocket session cache.
     * @return map of websocket session cache.
     */
    val allWebSocketSession: Map<String, WebsocketIdentifier> get() = userSessionCache

    /**
     * Add websocket session cache.
     * @param data websocket session cache.
     */
    fun put(data: WebsocketIdentifier) {
        userSessionCache[data.email] = data
        broadCastMessage(message = data.email, type = WsType.Online)
        broadCastAllUserList(user = data.email)
    }

    /**
     * Get or default websocket session cache.
     * @param key key of websocket session cache.
     * @return websocket session cache.
     */
    fun getOrNull(key: String): WebsocketIdentifier? = userSessionCache.get(key = key)

    /**
     * Remove websocket session cache.
     * @param key key of websocket session cache.
     */
    fun deleteSession(key: String) {
        val websocketIdentifier: WebsocketIdentifier? = getOrNull(key = key)
        if (websocketIdentifier?.session == null) {
            log.error("Unable to remove the websocket session; serious error!")
            return
        }
        userSessionCache.remove(key = key)
        broadCastAllUserList(user = websocketIdentifier.email)
        broadCastMessage(message = websocketIdentifier.email, type = WsType.Offline)
    }

    /**
     * Broadcast message to all websocket session cache.
     * @param message message to broadcast.
     */
    private fun broadCastMessage(message: String, type: WsType) {
        val wsRequestBody: WsRequestBody = WsRequestBody()
            .also {
                it.from = "server"
                //it.to = null
                it.date = Instant.now().toEpochMilli()
                it.type = type
                it.content = message
            }
        allWebSocketSession.forEach {
            try {
                it.value.session.sendMessage(TextMessage(objectMapper.writeValueAsString(wsRequestBody)))
            } catch (e: Exception) {
                log.error("Exception while broadcasting: ${e.message}")
            }
        }
    }

    /**
     * Broadcast message to specific websocket session cache.
     * @param requestBody message to send.
     */
    fun sendPrivateMessage(requestBody: WsRequestBody) {
        val userTo: WebsocketIdentifier? = getOrNull(key = requestBody.to!!)
        if (userTo?.session == null) {
            log.error("User or Session not found in cache for user: ${requestBody.to}, returning...")
            return
        }
        requestBody.type = WsType.PrivateMessage
        requestBody.date = Instant.now().toEpochMilli()
        try {
            userTo.session.sendMessage(TextMessage(objectMapper.writeValueAsString(requestBody)))
        } catch (e: IOException) {
            log.error("Exception while sending message: ${ExceptionUtils.getMessage(e)}")
        }
    }

    /**
     * Broadcast message to specific websocket session cache.
     * @param from from user.
     * @param payload message to send.
     */
    fun sendMessage(from: String, to: String, type: WsType, payload: String? = null) {
        val userTo: WebsocketIdentifier? = getOrNull(key = to)
        if (userTo?.session == null) {
            log.error("User or Session not found in cache for user: $to, returning...")
            return
        }
        val requestBody: WsRequestBody = WsRequestBody().also {
            it.from = from
            it.to = to
            it.type = type
            it.date = Instant.now().toEpochMilli()
            if (payload !== null)
                it.content = payload
        }
        try {
            userTo.session.sendMessage(TextMessage(objectMapper.writeValueAsString(requestBody)))
        } catch (e: IOException) {
            log.error("Exception while sending message: ${ExceptionUtils.getMessage(e)}")
        }
    }

    /**
     * Broadcast message to all websocket session cache.
     * @param user user to broadcast.
     */
    private fun broadCastAllUserList(user: String): Unit =
        sendMessage(from = "server", to = user, type = WsType.Online, payload = userSessionCache.keys.joinToString(separator = ","))
}