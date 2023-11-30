package com.github.senocak.domain.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.github.senocak.util.validation.ValidEmail
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @JsonProperty("email")
    @Schema(example = "asenocak", description = "Email of the user", required = true, name = "email", type = "String")
    @field:NotBlank
    @field:Size(min = 3, max = 50)
    var email: String,

    @Schema(description = "Password of the user", name = "password", type = "String", example = "password", required = true)
    @field:NotBlank
    @field:Size(min = 6, max = 20)
    var password: String
): BaseDto()

data class RefreshTokenRequest(
    @Schema(example = "Lorem Ipsum", description = "Name of the user", required = true, name = "name", type = "String")
    @field:Size(min = 180, max = 188)
    var token: String
): BaseDto()

data class RegisterRequest(
    @Schema(example = "Lorem Ipsum", description = "Name of the user", required = true, name = "name", type = "String")
    @field:NotBlank
    @field:Size(min = 4, max = 40)
    var name: String,

    @Schema(example = "lorem@ipsum.com", description = "Email of the user", required = true, name = "email", type = "String")
//    @field:Pattern(regexp = AppConstants.MAIL_REGEX)
    @field:ValidEmail
    var email: String,

    @Schema(example = "asenocak123", description = "Password of the user", required = true, name = "password", type = "String")
    @field:NotBlank
    @field:Size(min = 6, max = 20)
    var password: String
): BaseDto()