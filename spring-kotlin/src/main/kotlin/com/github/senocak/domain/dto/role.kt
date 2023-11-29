package com.github.senocak.domain.dto

import com.github.senocak.util.RoleName
import io.swagger.v3.oas.annotations.media.Schema

data class RoleResponse(
    @Schema(example = "ROLE_USER", description = "Name of the role", required = true, name = "name")
    val name: RoleName
): BaseDto()