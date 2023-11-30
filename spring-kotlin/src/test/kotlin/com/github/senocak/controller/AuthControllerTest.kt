package com.github.senocak.controller

import com.github.senocak.TestConstants.USER_EMAIL
import com.github.senocak.TestConstants.USER_NAME
import com.github.senocak.TestConstants.USER_PASSWORD
import com.github.senocak.domain.Role
import com.github.senocak.domain.User
import com.github.senocak.domain.dto.LoginRequest
import com.github.senocak.domain.dto.RegisterRequest
import com.github.senocak.domain.dto.UserWrapperResponse
import com.github.senocak.exception.ServerException
import com.github.senocak.factory.UserFactory
import com.github.senocak.security.JwtTokenProvider
import com.github.senocak.service.FriendService
import com.github.senocak.service.RoleService
import com.github.senocak.service.UserService
import com.github.senocak.util.RoleName
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.function.Executable
import org.mockito.ArgumentMatchers.anyList
import org.mockito.InjectMocks
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.mockito.kotlin.doReturn
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.validation.BindingResult
import org.mockito.kotlin.eq

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for AuthController")
class AuthControllerTest {
    @InjectMocks lateinit var authController: AuthController
    private val userService = mock<UserService>()
    private val roleService = mock<RoleService>()
    private val tokenProvider = mock<JwtTokenProvider>()
    private val authenticationManager = mock<AuthenticationManager>()
    private val authentication = mock<Authentication>()
    private val passwordEncoder = mock<PasswordEncoder>()
    private val bindingResult = mock<BindingResult>()
    private val friendService = mock<FriendService>()

    var user: User = UserFactory.createUser()

    @Nested
    internal inner class LoginTest {
        private val loginRequest: LoginRequest = LoginRequest(
            email = USER_EMAIL,
            password = USER_PASSWORD
        )

        @Test
        @Throws(ServerException::class)
        fun givenSuccessfulPath_whenLogin_thenReturn200() {
            // Given
            whenever(methodCall = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(loginRequest.email, loginRequest.password)))
                .thenReturn(authentication)
            whenever(userService.findByEmail(email = loginRequest.email))
                .thenReturn(user)
            val generatedToken = "generatedToken"
            whenever(tokenProvider.generateJwtToken(email = eq(value = user.email), roles = anyList()))
                .thenReturn(generatedToken)
            // When
            val response: UserWrapperResponse = authController.login(loginRequest, bindingResult)
            // Then
            assertNotNull(response)
            assertEquals(generatedToken, response.token)
            assertEquals(user.name, response.userResponse.name)
            assertEquals(user.email, response.userResponse.email)
            assertEquals(user.roles.size, response.userResponse.roles?.size)
        }
    }

    @Nested
    internal inner class RegisterTest {
        private val registerRequest: RegisterRequest = RegisterRequest(
            name = USER_NAME,
            email = USER_EMAIL,
            password = USER_PASSWORD
        )

        @Test
        fun givenExistMail_whenRegister_thenThrowServerException() {
            // Given
            whenever(userService.existsByEmail(email = registerRequest.email)).thenReturn(true)
            // When
            val closureToTest = Executable { authController.register(signUpRequest = registerRequest, resultOfValidation = bindingResult) }
            // Then
            assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        fun givenNotValidRole_whenRegister_thenThrowServerException() {
            // Given
            whenever(roleService.findByName(roleName = RoleName.ROLE_USER)).thenReturn(null)
            // When
            val closureToTest = Executable { authController.register(signUpRequest = registerRequest, resultOfValidation = bindingResult) }
            // Then
            assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        fun givenNotLogin_whenRegister_thenThrowServerException() {
            // Given
            doReturn(value = Role()).`when`(roleService).findByName(roleName = RoleName.ROLE_USER)
            // When
            val closureToTest = Executable { authController.register(signUpRequest = registerRequest, resultOfValidation = bindingResult) }
            // Then
            assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        @Throws(ServerException::class)
        fun given_whenRegister_thenReturn201() {
            // Given
            whenever(roleService.findByName(roleName = RoleName.ROLE_USER)).thenReturn(Role())
            whenever(userService.save(user = any())).thenReturn(user)
            whenever(userService.findByEmail(email = registerRequest.email)).thenReturn(user)
            val generatedToken = "generatedToken"
            whenever(tokenProvider.generateJwtToken(email = eq(value = user.email), roles = anyList())).thenReturn(generatedToken)
            // When
            val response: ResponseEntity<UserWrapperResponse> = authController.register(signUpRequest = registerRequest, resultOfValidation = bindingResult)
            // Then
            assertNotNull(response)
            assertNotNull(response.body)
            assertEquals(HttpStatus.CREATED, response.statusCode)
            assertNotNull(response.body!!.userResponse)
            assertNotNull(response.body!!.token)
            assertEquals(user.name, response.body!!.userResponse.name)
            assertEquals(user.email, response.body!!.userResponse.email)
            assertEquals(user.roles.size, response.body!!.userResponse.roles?.size)
        }
    }
}