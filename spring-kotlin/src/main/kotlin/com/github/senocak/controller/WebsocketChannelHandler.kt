package com.github.senocak.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.github.senocak.domain.dto.WebsocketIdentifier
import com.github.senocak.domain.dto.WsRequestBody
import com.github.senocak.exception.ServerException
import com.github.senocak.security.JwtTokenProvider
import com.github.senocak.service.WebSocketCacheService
import com.github.senocak.util.AppConstants.logger
import com.github.senocak.util.OmaErrorMessageType
import com.github.senocak.util.split
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
                val (token: String, emailFromJWT: String) = getAccessTokenFromQueryParams(query = session.uri!!.query)
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
                val (_: String, emailFromJWT: String) = getAccessTokenFromQueryParams(query = session.uri!!.query)
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
                    val (_: String, emailFromJWT: String) = getAccessTokenFromQueryParams(query = session.uri!!.query)
                    requestBody.from = emailFromJWT
                    webSocketCacheService.sendPrivateMessage(requestBody = requestBody)
                    // TODO: save it to db
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

    /**
     * Parses the query string into a map of key/value pairs.
     * @param queryParamString The query string to parse.
     * @return A map of key/value pairs.
     */
    private fun getQueryParams(queryParamString: String): Map<String, String>? {
        val queryParams: MutableMap<String, String> = LinkedHashMap()
        if (queryParamString.isEmpty())
            return null
        val split: Array<String>? = queryParamString.split(delimiter = "&")
        if (split != null && split.size > 1) for (param: String in split) {
            val paramArray: Array<String>? = param.split(delimiter = "=")
            queryParams[paramArray!![0]] = paramArray[1]
        } else {
            val paramArray: Array<String>? = queryParamString.split(delimiter = "=")
            queryParams[paramArray!![0]] = paramArray[1]
        }
        return queryParams
    }

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

    private fun getAccessTokenFromQueryParams(query: String): Pair<String, String>  {
        val queryParams: Map<String, String> = getQueryParams(queryParamString = query) ?: throw Exception("QueryParams can not be empty")
        val accessToken: String = queryParams["access_token"] ?: throw Exception("Auth can not be empty")
        return Pair(first = accessToken, second = jwtTokenProvider.getEmailFromJWT(token = accessToken))
    }
}
