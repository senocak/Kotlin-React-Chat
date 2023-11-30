package com.github.senocak.domain.dto

import com.github.senocak.util.WsType
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.web.socket.WebSocketSession

data class WebsocketIdentifier(
    @Schema(example = "user", description = "user", required = true, name = "email", type = "String")
    val email: String,

    @Schema(description = "token", name = "token", type = "String", example = "token", required = true)
    val token: String,

    @Schema(description = "session", name = "session", type = "String", example = "session", required = true)
    var session: WebSocketSession
): BaseDto()

data class WsRequestBody(
    var from: String,
    var to: String? = null,
    var type: WsType,
    var content: Any? = null,
    var date: Long
): BaseDto()