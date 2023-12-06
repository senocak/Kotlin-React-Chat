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

class WsRequestBody: BaseDto() {
    lateinit var from: String
    lateinit var  to: String
    lateinit var type: WsType
    lateinit var content: Any
    var date: Long = 0
}