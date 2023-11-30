package com.github.senocak.controller

import com.github.senocak.domain.Friend
import com.github.senocak.domain.Message
import com.github.senocak.domain.User
import com.github.senocak.domain.dto.ExceptionDto
import com.github.senocak.domain.dto.MessagesPaginationDTO
import com.github.senocak.domain.dto.PaginationCriteria
import com.github.senocak.domain.dto.UpdateUserDto
import com.github.senocak.domain.dto.UserResponse
import com.github.senocak.domain.dto.UserWrapperResponse
import com.github.senocak.exception.ServerException
import com.github.senocak.security.Authorize
import com.github.senocak.service.FriendService
import com.github.senocak.service.UserService
import com.github.senocak.service.WebSocketCacheService
import com.github.senocak.util.convertEntityToDto
import com.github.senocak.util.AppConstants.ADMIN
import com.github.senocak.util.AppConstants.USER
import com.github.senocak.util.AppConstants.securitySchemeName
import com.github.senocak.util.FriendShipStatus
import com.github.senocak.util.OmaErrorMessageType
import com.github.senocak.util.PageRequestBuilder
import com.github.senocak.util.WsType
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.constraints.Pattern
import java.util.ArrayList
import java.util.Date
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.validation.BindingResult
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Validated
@RestController
@Authorize(roles = [ADMIN, USER])
@RequestMapping(UserController.URL)
@Tag(name = "User", description = "User Controller")
class UserController(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder,
    private val friendService: FriendService,
    private val webSocketCacheService: WebSocketCacheService
): BaseController() {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    @Throws(ServerException::class)
    @Operation(
        summary = "Get me",
        tags = ["User"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = UserWrapperResponse::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ],
        security = [SecurityRequirement(name = securitySchemeName, scopes = [ADMIN, USER])]
    )
    @GetMapping("/me")
    fun me(): UserWrapperResponse =
        UserWrapperResponse(userResponse = userService.loggedInUser.convertEntityToDto(roles = true))

    @PatchMapping("/me")
    @Operation(
        summary = "Update user",
        tags = ["User"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = HashMap::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ],
        security = [SecurityRequirement(name = securitySchemeName, scopes = [ADMIN, USER])]
    )
    @Throws(ServerException::class)
    fun patchMe(request: HttpServletRequest,
        @Parameter(description = "Request body to update", required = true) @Validated @RequestBody userDto: UpdateUserDto,
        resultOfValidation: BindingResult
    ): UserWrapperResponse {
        validate(resultOfValidation)
        val user: User = userService.loggedInUser
        val name: String? = userDto.name
        if (!name.isNullOrEmpty())
            user.name = name
        val password: String? = userDto.password
        val passwordConfirmation: String? = userDto.passwordConfirmation
        if (!password.isNullOrEmpty()) {
            if (passwordConfirmation.isNullOrEmpty()) {
                val message = "Password confirmation not provided"
                log.error(message)
                throw ServerException(OmaErrorMessageType.BASIC_INVALID_INPUT, arrayOf(message), HttpStatus.BAD_REQUEST)
            }
            if (passwordConfirmation != password) {
                val message = "Password and confirmation not matched"
                log.error(message)
                throw ServerException(OmaErrorMessageType.BASIC_INVALID_INPUT, arrayOf(message), HttpStatus.BAD_REQUEST)
            }
            user.password = passwordEncoder.encode(password)
        }
        return UserWrapperResponse(userResponse = userService.save(user = user).convertEntityToDto(roles = true))
    }

    @PutMapping("/friend/{email}")
    @Operation(
        summary = "Add friend to user",
        tags = ["User"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = HashMap::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ],
        security = [SecurityRequirement(name = securitySchemeName, scopes = [ADMIN, USER])]
    )
    @Throws(ServerException::class)
    fun addFriend(@Parameter(description = "User email to add as friend", required = true) @PathVariable email: String): UserResponse {
        val me: User = userService.loggedInUser
        if (me.email == email)
            "You can not add himself/herself"
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.CONFLICT)
                }
        val person: User = userService.findByEmail(email = email)
        val friendList: MutableList<Friend> = friendService.findAll(specification = friendService.createSpecification(owner = me))
        val friend: Friend? = friendList.find { f: Friend -> (f.owner.email == me.email && f.person.email == email) || (f.person.email == me.email && f.owner.email == email) }
        when {
            friend !== null -> {
                if (friend.status == FriendShipStatus.Accepted)
                    "User: ${me.email} is already friend with $email"
                        .also { log.error(it) }
                        .run {
                            throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                        }
                else if (friend.status == FriendShipStatus.Pending) {
                    if (friend.blockedBy != null)
                        if (friend.blockedBy == me)
                            "You have to unblock ${person.email} first."
                                .also { log.error(it) }
                                .also {
                                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                        variables = arrayOf(it), statusCode = HttpStatus.BAD_REQUEST)
                                }
                        else {
                            "You are blocked by ${person.email} so you can not accept this"
                                .also { log.error(it) }
                                .also {
                                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                        variables = arrayOf(it), statusCode = HttpStatus.BAD_REQUEST)
                                }
                        }
                    else if (friend.owner == me)
                        "Friend with ${person.email} is already pending status"
                            .also { log.error(it) }
                            .run {
                                throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                    variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                            }
                    else {
                        friend.status = FriendShipStatus.Accepted
                        friend.approvedAt = Date(System.currentTimeMillis())
                        friendService.save(friend = friend)
                        webSocketCacheService.sendMessage(from = me.email, to = friend.owner.email, type = WsType.FriendShipAccepted)
                    }
                } else {
                    "Unsupported status: ${friend.status} for ${me.email}"
                        .also { log.error(it) }
                        .run {
                            throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                        }
                }
            }
            else -> {
                friendService.save(friend = Friend(owner = me, person = person, status = FriendShipStatus.Pending))
                    .also { friendList.add(element = it) }
                    .run {
                        webSocketCacheService.sendMessage(from = me.email, to = this.person.email, type = WsType.FriendShipPending)
                    }
            }
        }
        return me.convertEntityToDto(roles = true, friends = friendList.map { f: Friend -> f.convertEntityToDto() })
    }

    @DeleteMapping("/friend/{email}")
    @Operation(
        summary = "Delete friend from user",
        tags = ["User"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = HashMap::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ],
        security = [SecurityRequirement(name = securitySchemeName, scopes = [ADMIN, USER])]
    )
    @Throws(ServerException::class)
    fun deleteFriend(@Parameter(description = "User email to delete", required = true) @PathVariable email: String): UserResponse {
        val me: User = userService.loggedInUser
        if (me.email == email)
            "You can not remove himself/herself"
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.CONFLICT)
                }
        val person: User = userService.findByEmail(email = email)
        val friendList: MutableList<Friend> = friendService.findAll(specification = friendService.createSpecification(owner = me))

        val friend: Friend = friendList.find { f: Friend -> (f.owner.email == me.email && f.person.email == email) || (f.person.email == me.email && f.owner.email == email) }
            ?: "User: ${me.email} is not friend with ${person.email}"
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                }
        if (friend.blockedBy !== null) {
            (if (friend.blockedBy == me) "You blocked ${person.email}, you have to unblock it first" else "${person.email} is blocked you.")
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                }
        }
        friendService.delete(friend = friend)
            .also { log.info("User: ${me.email} friend with ${person.email} is deleted") }
            .also { friendList.remove(element = friend) }
            .also {
                val to: User = if (friend.owner == me) friend.person else friend.owner
                webSocketCacheService.sendMessage(from = me.email, to = to.email, type = WsType.FriendShipDeleted)
            }
        return me.convertEntityToDto(roles = true, friends = friendList.map { f: Friend -> f.convertEntityToDto() })
    }

    @PatchMapping("/friend/{email}")
    @Operation(
        summary = "Block/Unblock friend from user",
        tags = ["User"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = HashMap::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ],
        security = [SecurityRequirement(name = securitySchemeName, scopes = [ADMIN, USER])]
    )
    @Throws(ServerException::class)
    fun blockUnblockFriend(
        @Parameter(description = "User email to delete", required = true) @PathVariable email: String,
        @Parameter(name = "operation", description = "Block or Unblock operation", schema = Schema(type = "string", allowableValues = ["block", "unblock"]))
            @RequestParam(required = true) @Pattern(regexp = "block|unblock") operation: String
    ): UserResponse {
        val me: User = userService.loggedInUser
        if (me.email == email)
            "You can not block/unblock yourself"
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.CONFLICT)
                }
        val person: User = userService.findByEmail(email = email)
        val friendList: MutableList<Friend> = friendService.findAll(specification = friendService.createSpecification(owner = me))
        val friend: Friend = friendList.find { f: Friend -> (f.owner.email == me.email && f.person.email == email) || (f.person.email == me.email && f.owner.email == email) }
            ?: "User: ${me.email} is not friend with ${person.email} for $operation operation"
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                }
        when (operation) {
            "block" -> {
                when {
                    friend.blockedBy != null -> (when (friend.blockedBy) {
                        me -> "You already blocked ${person.email}"
                        else -> "${person.email} is blocked you. He/she has to unblock you"
                    })
                        .also { log.error(it) }
                        .run {
                            throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                        }
                    else -> {
                        friend.blockedBy = me
                        friend.blockedAt = Date(System.currentTimeMillis())
                        friendService.save(friend = friend)
                        val to: User = if (friend.owner == me) friend.person else friend.owner
                        webSocketCacheService.sendMessage(from = me.email, to = to.email, type = WsType.FriendShipBlocked)
                    }
                }
            }
            "unblock" -> {
                when {
                    friend.blockedBy == null -> "${person.email} is not blocked."
                        .also { log.error(it) }
                        .run {
                            throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                        }
                    else -> {
                        when (friend.blockedBy) {
                            me -> {
                                friend.blockedBy = null
                                friend.blockedAt = null
                                friendService.save(friend = friend)
                                val to: User = if (friend.owner == me) friend.person else friend.owner
                                webSocketCacheService.sendMessage(from = me.email, to = to.email, type = WsType.FriendShipUnBlocked)
                            }
                            else -> {
                                "You are not unauthorized to unblock ${person.email}"
                                    .also { log.error(it) }
                                    .run {
                                        throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                                            variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                                    }
                            }
                        }
                    }
                }
            }
            else -> "Unsupported operation"
                .also { log.error(it) }
                .run {
                    throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                        variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST)
                }
        }
        return me.convertEntityToDto(roles = true, friends = friendList.map { f: Friend -> f.convertEntityToDto() })
    }

    @Throws(ServerException::class)
    @Operation(
        summary = "Get messages between",
        tags = ["User"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = UserWrapperResponse::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ],
        security = [SecurityRequirement(name = securitySchemeName, scopes = [ADMIN, USER])]
    )
    @GetMapping("/message/{email}")
    fun getMessagesBetween(
        @Parameter(description = "User email to delete", required = true) @PathVariable email: String,
        @Parameter(name = "page", description = "Page number", example = "0") @RequestParam(defaultValue = "1", required = false) page: Int,
        @Parameter(name = "size", description = "Page size", example = "20") @RequestParam(defaultValue = "\${spring.data.web.pageable.default-page-size:10}", required = false) size: Int,
        @Parameter(name = "sortBy", description = "Sort by column", example = "createdAt") @RequestParam(defaultValue = "createdAt", required = false) sortBy: String,
        @Parameter(name = "sort", description = "Sort direction", schema = Schema(type = "string", allowableValues = ["asc", "desc"])) @RequestParam(defaultValue = "asc", required = false) @Pattern(regexp = "asc|desc") sort: String,
        @Parameter(name = "q", description = "Search keyword", example = "lorem") @RequestParam(required = false) q: String?,
    ): MessagesPaginationDTO =
        userService.loggedInUser
            .run me@ {
                val columns: ArrayList<String> = arrayListOf("id", "from", "to", "read", "createdAt", "updatedAt")
                if (columns.none { it == sortBy }) {
                    "Invalid sort column"
                        .also { log.error(it) }
                        .run error@ { throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                            variables = arrayOf(this@error), statusCode = HttpStatus.BAD_REQUEST) }
                }
                PaginationCriteria(page = page, size = size)
                    .also { it: PaginationCriteria ->
                        it.sortBy = sortBy
                        it.sort = sort
                        it.columns = columns
                    }
                    .run paginationCriteria@ {
                        userService.findAll(
                            specification = userService.createSpecification(
                                user1 = this@me,
                                user2 = userService.findByEmail(email = email),
                                body = q
                            ),
                            pageRequest = PageRequestBuilder.build(paginationCriteria = this@paginationCriteria)
                        )
                    }
                    .run messagePage@ {
                        MessagesPaginationDTO(
                            pageModel = this@messagePage,
                            items = this@messagePage.content.map { it: Message -> it.convertEntityToDto() }.toList(),
                            sortBy = sortBy,
                            sort = sort
                        )
                    }
            }

    // TODO: fire event in ws
    companion object {
        const val URL = "/api/v1/user"
    }
}