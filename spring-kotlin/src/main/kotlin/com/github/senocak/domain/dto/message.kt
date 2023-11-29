package com.github.senocak.domain.dto

import com.github.senocak.domain.Message
import io.swagger.v3.oas.annotations.media.Schema
import java.util.UUID
import org.springframework.data.domain.Page

data class MessageDTO(
    @Schema(example = "107d47a5-51bf-489a-afc2-77cbf7425e13", description = "Id of the message", required = true, name = "id", type = "UUID")
    val id: UUID,

    @Schema(description = "From message", required = true, name = "from")
    val from: UserResponse,

    @Schema(description = "To message", required = true, name = "from")
    val to: UserResponse,

    @Schema(example = "123213123", description = "Created date of the message", required = true, name = "createdAt", type = "Long")
    val createdAt: Long,

    @Schema(example = "123213123", description = "Update date of the message", required = true, name = "updatedAt", type = "Long")
    val updatedAt: Long
): BaseDto() {
    @Schema(example = "107d47a5", description = "Text data of the message", required = false, name = "text", type = "String")
    var text: String? = null

    @Schema(example = "qwertyusdfg....", description = "Binary data of the message", required = false, name = "binary", type = "String")
    var binary: String? = null

    @Schema(example = "123231312", description = "Message read datetime?", required = false, name = "readAt", type = "Long")
    var readAt: Long? = null
}

class MessagesPaginationDTO(
    pageModel: Page<Message>,
    items: List<MessageDTO>,
    sortBy: String? = null,
    sort: String? = null
): PaginationResponse<Message, MessageDTO>(page = pageModel, items = items, sortBy = sortBy, sort = sort)