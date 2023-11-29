package com.github.senocak.domain.dto

import com.github.senocak.util.WsType
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.web.socket.WebSocketSession

data class WebsocketIdentifier(
    @Schema(example = "user", description = "user", required = true, name = "username", type = "String")
    val user: String,

    @Schema(description = "token", name = "token", type = "String", example = "token", required = true)
    val token: String? = null,

    @Schema(description = "session", name = "session", type = "String", example = "session", required = true)
    var session: WebSocketSession? = null
): BaseDto()

data class WsRequestBody(
    var from: String? = null,
    var to: String? = null,
    var content: Any? = null,
    var type: WsType? = null,
    var date: Long? = null
): BaseDto()