package com.github.senocak.controller

import com.github.senocak.domain.Friend
import com.github.senocak.domain.Role
import com.github.senocak.domain.User
import com.github.senocak.domain.dto.ExceptionDto
import com.github.senocak.domain.dto.LoginRequest
import com.github.senocak.domain.dto.RefreshTokenRequest
import com.github.senocak.domain.dto.RegisterRequest
import com.github.senocak.domain.dto.UserResponse
import com.github.senocak.domain.dto.UserWrapperResponse
import com.github.senocak.exception.ServerException
import com.github.senocak.security.Authorize
import com.github.senocak.security.JwtTokenProvider
import com.github.senocak.service.FriendService
import com.github.senocak.service.RoleService
import com.github.senocak.service.UserService
import com.github.senocak.util.convertEntityToDto
import com.github.senocak.util.AppConstants
import com.github.senocak.util.OmaErrorMessageType
import com.github.senocak.util.RoleName
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.validation.BindingResult
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.servlet.http.HttpServletRequest
import org.springframework.data.domain.Pageable

@RestController
@RequestMapping(AuthController.URL)
@Tag(name = "Authentication", description = "AUTH API")
class AuthController(
    private val userService: UserService,
    private val roleService: RoleService,
    private val tokenProvider: JwtTokenProvider,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val friendService: FriendService
): BaseController() {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    @PostMapping("/login")
    @Operation(summary = "Login Endpoint", tags = ["Authentication"])
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = UserWrapperResponse::class)))),
            ApiResponse(responseCode = "400", description = "Bad credentials",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ]
    )
    @Throws(ServerException::class)
    fun login(
        @Parameter(description = "Request body to login", required = true) @Validated @RequestBody loginRequest: LoginRequest,
        resultOfValidation: BindingResult
    ): UserWrapperResponse {
        validate(resultOfValidation = resultOfValidation)
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
        )
        val user: User = userService.findByUsername(username = loginRequest.username!!)
        val userResponse: UserResponse = user.convertEntityToDto(
            roles = true,
            friends = friendService.findAll(specification = friendService.createSpecification(owner = user))
                .map { f: Friend -> f.convertEntityToDto() }
        )
        return generateUserWrapperResponse(userResponse = userResponse)
    }

    @PostMapping("/register")
    @Operation(
        summary = "Register Endpoint",
        tags = ["Authentication"],
        responses = [
            ApiResponse(responseCode = "200", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = UserWrapperResponse::class)))),
            ApiResponse(responseCode = "400", description = "Bad credentials",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ]
    )
    @Throws(ServerException::class)
    fun register(
        @Parameter(description = "Request body to register", required = true) @Validated @RequestBody signUpRequest: RegisterRequest,
        resultOfValidation: BindingResult
    ): ResponseEntity<UserWrapperResponse> {
        validate(resultOfValidation = resultOfValidation)
        if (userService.existsByUsername(username = signUpRequest.username!!))
            throw ServerException(omaErrorMessageType = OmaErrorMessageType.JSON_SCHEMA_VALIDATOR, variables = arrayOf("Username is already taken!"))
                    .also { log.error("Username: ${signUpRequest.username} is already taken!") }
        if (userService.existsByEmail(email = signUpRequest.email!!))
            throw ServerException(omaErrorMessageType = OmaErrorMessageType.JSON_SCHEMA_VALIDATOR, variables = arrayOf("Email Address already in use!"))
                    .also { log.error("Email Address: ${signUpRequest.email} is already taken!") }
        val userRole: Role = roleService.findByName(roleName = RoleName.ROLE_USER)
                ?: throw ServerException(omaErrorMessageType = OmaErrorMessageType.MANDATORY_INPUT_MISSING, variables = arrayOf("User Role is not found"))
                        .also { log.error("User Role is not found") }
        val user = User(name = signUpRequest.name!!, username = signUpRequest.username!!, email = signUpRequest.email!!,
            password = passwordEncoder.encode(signUpRequest.password), roles = arrayListOf(userRole)
        )
        val result: User = userService.save(user = user)
        log.info("User created. User: $result")
        val `object`: UserWrapperResponse? = try {
            login(loginRequest = LoginRequest(username = signUpRequest.username, password = signUpRequest.password), resultOfValidation = resultOfValidation)
        } catch (e: Exception) {
            throw ServerException(omaErrorMessageType = OmaErrorMessageType.GENERIC_SERVICE_ERROR, statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
                variables = arrayOf("Error occurred for generating jwt attempt", HttpStatus.INTERNAL_SERVER_ERROR.toString()))
                    .also { log.error("Exception: ${e.message}") }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(`object`)
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token Endpoint", tags = ["Authentication"])
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = UserWrapperResponse::class)))),
            ApiResponse(responseCode = "400", description = "Bad credentials",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ]
    )
    @Throws(ServerException::class)
    fun refresh(
        @Parameter(description = "Request body to refreshing token", required = true) @Validated @RequestBody refreshTokenRequest: RefreshTokenRequest,
        resultOfValidation: BindingResult
    ): UserWrapperResponse {
        validate(resultOfValidation = resultOfValidation)
        val userNameFromJWT: String = tokenProvider.getUserNameFromJWT(token = refreshTokenRequest.token!!)
        val user: User = userService.findByUsername(username = userNameFromJWT)!!
            .also { tokenProvider.markLogoutEventForToken(username = it.username) }
        return generateUserWrapperResponse(userResponse = user.convertEntityToDto())
    }

    @PostMapping("/logout")
    @Authorize(roles = [AppConstants.ADMIN, AppConstants.USER])
    @Operation(summary = "Logout Endpoint", tags = ["Authentication"])
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "successful operation",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = UserWrapperResponse::class)))),
            ApiResponse(responseCode = "400", description = "Bad credentials",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class)))),
            ApiResponse(responseCode = "500", description = "internal server error occurred",
                content = arrayOf(Content(mediaType = "application/json", schema = Schema(implementation = ExceptionDto::class))))
        ]
    )
    @Throws(ServerException::class)
    fun logout(request: HttpServletRequest): ResponseEntity<Unit> {
        userService.loggedInUser.also { tokenProvider.markLogoutEventForToken(username = it.username) }
        return ResponseEntity.noContent().build()
    }

    /**
     * Generate UserWrapperResponse with given UserResponse
     * @param userResponse -- UserResponse that contains user data
     * @return UserWrapperResponse
     */
    private fun generateUserWrapperResponse(userResponse: UserResponse): UserWrapperResponse {
        val roles: List<String> = userResponse.roles?.map { RoleName.fromString(r = it.name.name)!!.name }!!.toList()
        val jwtToken: String = tokenProvider.generateJwtToken(username = userResponse.username, roles = roles)
        val refreshToken: String = tokenProvider.generateRefreshToken(username = userResponse.username, roles = roles)
        return UserWrapperResponse(userResponse = userResponse, token = jwtToken, refreshToken = refreshToken)
            .also { log.info("UserWrapperResponse is generated: $it") }
    }

    companion object {
        const val URL = "/api/v1/auth"
    }
}