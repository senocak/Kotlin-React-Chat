package com.github.senocak.util

import com.github.senocak.domain.Friend
import com.github.senocak.domain.Message
import com.github.senocak.domain.User
import com.github.senocak.domain.Role
import com.github.senocak.domain.dto.MessageDTO
import com.github.senocak.domain.dto.RoleResponse
import com.github.senocak.domain.dto.UserFriends
import com.github.senocak.domain.dto.UserResponse
import java.util.Date
import org.springframework.util.StringUtils

/**
 * @return -- UserResponse object
 */
fun User.convertEntityToDto(roles: Boolean = false, friends: List<UserFriends>? = null): UserResponse =
    UserResponse(
        name = this.name,
        email = this.email,
        username = this.username
    ).also {
        when {
            roles -> it.roles = this.roles.map { r: Role -> r.convertEntityToDto() }.toList()
        }
        when {
            friends != null -> it.friends = friends
        }
    }

/**
 * @return -- RoleResponse object
 */
fun Friend.convertEntityToDto(): UserFriends =
    UserFriends(
        status = this.status,
        person = this.person.convertEntityToDto(),
        owner = this.owner.convertEntityToDto()
    ).also {
        when {
            this.blockedBy != null -> it.blockedBy = this.blockedBy!!.convertEntityToDto()
        }
        when {
            this.approvedAt != null -> it.approvedAt = this.approvedAt!!.toLong()
        }
        when {
            this.blockedAt != null -> it.blockedAt = this.blockedAt!!.toLong()
        }
    }

/**
 * @return -- RoleResponse object
 */
fun Role.convertEntityToDto(): RoleResponse = RoleResponse(name = this.name!!)

/**
 * @return -- RoleResponse object
 */
fun Message.convertEntityToDto(): MessageDTO =
    MessageDTO(
        id = this.id!!,
        from = this.from.convertEntityToDto().also { it.roles = null },
        to = this.to.convertEntityToDto().also { it.roles = null },
        createdAt = this.createdAt.toLong(),
        updatedAt = this.updatedAt.toLong()
    ).also {
        when {
            this.text != null -> it.text = this.text
        }
        when {
            this.binary != null -> it.binary = this.binary
        }
        when {
            this.readAt != null -> it.readAt = this.readAt!!.toLong()
        }
    }

/**
 * @return -- converted timestamp object that is long type
 */
private fun Date.toLong(): Long = this.time / 1000

/**
 * Split a string into two parts, separated by a delimiter.
 * @param delimiter The delimiter string
 * @return The array of two strings.
 */
fun String.split(delimiter: String): Array<String>? = StringUtils.split(this, delimiter)