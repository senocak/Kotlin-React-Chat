package com.github.senocak.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.github.senocak.domain.dto.WebsocketIdentifier
import com.github.senocak.domain.dto.WsRequestBody
import com.github.senocak.exception.ServerException
import com.github.senocak.security.JwtTokenProvider
import com.github.senocak.service.WebSocketCacheService
import com.github.senocak.util.AppConstants.logger
import com.github.senocak.util.OmaErrorMessageType
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock
import org.slf4j.Logger
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.socket.BinaryMessage
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.PingMessage
import org.springframework.web.socket.PongMessage
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.WebSocketMessage
import org.springframework.web.socket.WebSocketSession

@Component
class WebsocketChannelHandler(
    private val webSocketCacheService: WebSocketCacheService,
    private val jwtTokenProvider: JwtTokenProvider,
    private val objectMapper: ObjectMapper
): WebSocketHandler {
    val log: Logger = logger()
    private val lock = ReentrantLock(true)

    /**
     * A method that is called when a new WebSocket session is created.
     * @param session The new WebSocket session.
     */
    override fun afterConnectionEstablished(session: WebSocketSession): Unit =
        lock.withLock {
            try {
                if (session.uri == null)
                    log.error("Unable to retrieve the websocket session; serious error!").also { return }
                val headers: HttpHeaders = session.handshakeHeaders
                if (!headers.containsKey("Authorization"))
                    log.error("Token not found; rejecting!").also { return }
                val (emailFromJWT: String, token: String) = getEmailFromJWT(headers = headers)
                WebsocketIdentifier(email = emailFromJWT, token = token, session = session)
                    .also { log.info("Websocket session established: $it") }
                    .run { webSocketCacheService.put(data = this) }
            } catch (ex: Throwable) {
                log.error("A serious error has occurred with websocket post-connection handling. Exception is: ${ex.message}")
            }
        }

    /**
     * A method that is called when a WebSocket session is closed.
     * @param session The WebSocket session that is closed.
     * @param status The status of the close.
     */
    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus): Unit =
        lock.withLock {
            try {
                if (session.uri == null)
                    log.error("Unable to retrieve the websocket session; serious error!").also { return }
                val headers: HttpHeaders = session.handshakeHeaders
                if (!headers.containsKey("Authorization"))
                    log.error("Token not found; rejecting!").also { return }
                val (emailFromJWT: String, _: String) = getEmailFromJWT(headers = headers)
                webSocketCacheService.deleteSession(key = emailFromJWT)
                    .also { log.debug("Websocket for $emailFromJWT has been closed") }
            } catch (ex: Throwable) {
                log.error("Error occurred while closing websocket channel:${ex.message}")
            }
        }

    override fun handleMessage(session: WebSocketSession, message: WebSocketMessage<*>) {
        when (message) {
            is PingMessage -> log.trace("PingMessage: $message")
            is PongMessage -> log.trace("PongMessage: $message")
            is BinaryMessage -> log.trace("BinaryMessage: $message")
            is TextMessage -> {
                val body: WsRequestBody = objectMapper.readValue(message.payload, WsRequestBody::class.java)
                log.trace("TextMessage: $body")
                try {
                    val requestBody: WsRequestBody = objectMapper.readValue(message.payload, WsRequestBody::class.java)
                    val (emailFromJWT: String, _: String) = getEmailFromJWT(headers = session.handshakeHeaders)
                    requestBody.from = emailFromJWT
                    webSocketCacheService.sendPrivateMessage(requestBody = requestBody)
                    log.info("Websocket message sent: ${message.payload}")
                } catch (ex: Exception) {
                    log.error("Unable to parse request body; Exception: ${ex.message}")
                }
            }
            else -> session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Not supported"))
                .also { log.error("Not supported. ${message.javaClass}") }
        }
    }

    override fun handleTransportError(session: WebSocketSession, exception: Throwable): Unit = log.info("handleTransportError")

    override fun supportsPartialMessages(): Boolean = true

    private fun getEmailFromJWT(headers: HttpHeaders): Pair<String, String> =
        headers["Authorization"]
            .run {
                return when {
                    this != null && this.size > 0 -> {
                        var first: String = this.first()
                        if (first.startsWith("Bearer "))
                            first = first.substring(startIndex = 7)
                        Pair(first = jwtTokenProvider.getEmailFromJWT(token = first), second = first)
                    }
                    else -> throw ServerException(omaErrorMessageType = OmaErrorMessageType.GENERIC_SERVICE_ERROR,
                        variables = arrayOf("token is invalid"), statusCode = HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }
}
