package com.github.senocak.controller

import com.github.senocak.TestConstants.USER_EMAIL
import com.github.senocak.TestConstants.USER_NAME
import com.github.senocak.TestConstants.USER_PASSWORD
import com.github.senocak.TestConstants.USER_USERNAME
import com.github.senocak.domain.Role
import com.github.senocak.domain.User
import com.github.senocak.domain.dto.LoginRequest
import com.github.senocak.domain.dto.RegisterRequest
import com.github.senocak.domain.dto.UserWrapperResponse
import com.github.senocak.exception.ServerException
import com.github.senocak.factory.UserFactory
import com.github.senocak.security.JwtTokenProvider
import com.github.senocak.service.RoleService
import com.github.senocak.service.UserService
import com.github.senocak.util.RoleName
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.function.Executable
import org.mockito.ArgumentMatchers.anyList
import org.mockito.InjectMocks
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.doReturn
import org.mockito.junit.jupiter.MockitoExtension
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
    @InjectMocks var authController: AuthController? = null

    private val userService = mock(UserService::class.java)
    private val roleService = mock(RoleService::class.java)
    private val tokenProvider = mock(JwtTokenProvider::class.java)
    private val authenticationManager = mock(AuthenticationManager::class.java)
    private val authentication = mock(Authentication::class.java)
    private val passwordEncoder = mock(PasswordEncoder::class.java)
    private val bindingResult = mock(BindingResult::class.java)

    var user: User = UserFactory.createUser()

    @Nested
    internal inner class LoginTest {
        private val loginRequest: LoginRequest = LoginRequest()
        @BeforeEach
        fun setup() {
            loginRequest.email = USER_NAME
            loginRequest.password = USER_PASSWORD
        }

        @Test
        @Throws(ServerException::class)
        fun givenSuccessfulPath_whenLogin_thenReturn200() {
            // Given
            `when`(authenticationManager.authenticate(UsernamePasswordAuthenticationToken(
                loginRequest.email, loginRequest.password))).thenReturn(authentication)
            `when`(userService.findByUsername(loginRequest.email!!)).thenReturn(user)
            val generatedToken = "generatedToken"
            `when`(tokenProvider.generateJwtToken(eq(user.username), anyList())).thenReturn(generatedToken)
            // When
            val response: UserWrapperResponse = authController!!.login(loginRequest, bindingResult!!)
            // Then
            Assertions.assertNotNull(response)
            Assertions.assertEquals(generatedToken, response.token)
            Assertions.assertEquals(user.name, response.userResponse.name)
            Assertions.assertEquals(user.username, response.userResponse.username)
            Assertions.assertEquals(user.email, response.userResponse.email)
            Assertions.assertEquals(user.roles.size, response.userResponse.roles?.size)
        }
    }

    @Nested
    internal inner class RegisterTest {
        private val registerRequest: RegisterRequest = RegisterRequest()

        @BeforeEach
        fun setup() {
            registerRequest.name = USER_NAME
            registerRequest.username = USER_USERNAME
            registerRequest.email = USER_EMAIL
            registerRequest.password = USER_PASSWORD
        }

        @Test
        fun givenExistUserName_whenRegister_thenThrowServerException() {
            // Given
            `when`(userService!!.existsByUsername(registerRequest.username!!)).thenReturn(true)
            // When
            val closureToTest = Executable { authController!!.register(registerRequest, bindingResult!!) }
            // Then
            Assertions.assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        fun givenExistMail_whenRegister_thenThrowServerException() {
            // Given
            `when`(userService!!.existsByEmail(registerRequest.email!!)).thenReturn(true)
            // When
            val closureToTest = Executable { authController!!.register(registerRequest, bindingResult!!) }
            // Then
            Assertions.assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        fun givenNotValidRole_whenRegister_thenThrowServerException() {
            // Given
            `when`(roleService!!.findByName(RoleName.ROLE_USER)).thenReturn(null)
            // When
            val closureToTest = Executable { authController!!.register(registerRequest, bindingResult!!) }
            // Then
            Assertions.assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        fun givenNotLogin_whenRegister_thenThrowServerException() {
            // Given
            doReturn(Role()).`when`(roleService).findByName(RoleName.ROLE_USER)
            // When
            val closureToTest = Executable { authController!!.register(registerRequest, bindingResult!!) }
            // Then
            Assertions.assertThrows(ServerException::class.java, closureToTest)
        }

        @Test
        @Throws(ServerException::class)
        fun given_whenRegister_thenReturn201() {
            // Given
            `when`(roleService.findByName(RoleName.ROLE_USER)).thenReturn(Role())
            `when`(userService.save(user)).thenReturn(user)
            `when`(userService.findByUsername(registerRequest.username!!)).thenReturn(user)
            val generatedToken = "generatedToken"
            `when`(tokenProvider!!.generateJwtToken(eq(user.username), anyList())).thenReturn(generatedToken)
            // When
            val response: ResponseEntity<UserWrapperResponse> = authController!!.register(registerRequest, bindingResult!!)
            // Then
            Assertions.assertNotNull(response)
            Assertions.assertNotNull(response.body)
            Assertions.assertEquals(HttpStatus.CREATED, response.statusCode)
            Assertions.assertNotNull(response.body!!.userResponse)
            Assertions.assertNotNull(response.body!!.token)
            Assertions.assertEquals(user.name, response.body!!.userResponse.name)
            Assertions.assertEquals(user.username, response.body!!.userResponse.username)
            Assertions.assertEquals(user.email, response.body!!.userResponse.email)
            Assertions.assertEquals(user.roles.size, response.body!!.userResponse.roles?.size)
        }
    }
}