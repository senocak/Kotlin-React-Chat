package com.github.senocak.domain.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonPropertyOrder
import com.github.senocak.domain.User
import com.github.senocak.util.FriendShipStatus
import com.github.senocak.util.validation.PasswordMatches
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Size
import org.springframework.context.ApplicationEvent
import org.springframework.data.domain.Page

@JsonPropertyOrder("name", "email", "roles")
data class UserResponse(
    @JsonProperty("name")
    @Schema(example = "Lorem Ipsum", description = "Name of the user", required = true, name = "name", type = "String")
    var name: String,

    @Schema(example = "lorem@ipsum.com", description = "Email of the user", required = true, name = "email", type = "String")
    var email: String,

    @ArraySchema
    var roles: List<RoleResponse>? = null,

    @ArraySchema
    var friends: List<UserFriends>? = null
): BaseDto() {
    @Schema(example = "data:image/png;base64,iVB...", description = "Avatar of the user", required = false, name = "picture", type = "String")
    var picture: String? = null
}

@JsonPropertyOrder("user", "token", "refreshToken")
data class UserWrapperResponse(
    @JsonProperty("user")
    @Schema(required = true)
    var userResponse: UserResponse,

    @Schema(example = "eyJraWQiOiJ...", description = "Jwt Token", required = true, name = "token", type = "String")
    var token: String? = null,

    @Schema(example = "eyJraWQiOiJ...", description = "Refresh Token", required = true, name = "token", type = "String")
    var refreshToken: String? = null
): BaseDto()

class UserPaginationDTO(
    pageModel: Page<User>,
    items: List<UserResponse>,
    sortBy: String? = null,
    sort: String? = null
): PaginationResponse<User, UserResponse>(page = pageModel, items = items, sortBy = sortBy, sort = sort)

@PasswordMatches
data class UpdateUserDto(
    @Schema(example = "Anil", description = "Name", required = true, name = "name", type = "String")
    @field:Size(min = 4, max = 40)
    var name: String? = null,

    @Schema(example = "Anil123", description = "Password", required = true, name = "password", type = "String")
    @field:Size(min = 6, max = 20)
    var password: String? = null,

    @JsonProperty("password_confirmation")
    @Schema(example = "Anil123", description = "Password confirmation", required = true, name = "password", type = "String")
    @field:Size(min = 6, max = 20)
    var passwordConfirmation: String? = null
): BaseDto()

data class UserInfoCache(
    val email: String,
    val token: String,
    val type: String,
    val expireTimeStamp: Long
) : ApplicationEvent(email)

data class UserFriends(
    @Schema(required = true)
    var status: FriendShipStatus,

    @Schema(required = true)
    var person: UserResponse,

    @Schema(required = true)
    var owner: UserResponse
): BaseDto() {
    @Schema(required = true)
    var blockedBy: UserResponse? = null

    @Schema(example = "31132132", description = "Approved timestamp", required = true, name = "approvedAt", type = "Long")
    var approvedAt: Long? = null

    @Schema(example = "31132132", description = "Blocked timestamp", required = true, name = "blockedAt", type = "Long")
    var blockedAt: Long? = null
}